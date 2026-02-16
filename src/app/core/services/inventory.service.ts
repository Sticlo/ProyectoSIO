import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { Product } from '../../shared/models/product.model';

export type MovementType = 'sale' | 'restock' | 'adjustment' | 'return';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number; // Positivo para ingreso, negativo para salida
  previousStock: number;
  newStock: number;
  date: Date;
  orderId?: string; // Si es por una venta
  notes?: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical' | 'out';
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private storage = new StorageService();
  private readonly MOVEMENTS_KEY = 'inventory_movements';
  private readonly ALERTS_KEY = 'stock_alerts';
  
  // Signals
  private movementsSignal = signal<InventoryMovement[]>([]);
  private alertsSignal = signal<StockAlert[]>([]);
  
  // Computed values
  movements = this.movementsSignal.asReadonly();
  alerts = this.alertsSignal.asReadonly();
  
  activeAlerts = computed(() => 
    this.alertsSignal().filter(alert => 
      alert.severity === 'critical' || alert.severity === 'out'
    )
  );
  
  constructor() {
    this.loadMovements();
    this.loadAlerts();
  }
  
  /**
   * Cargar movimientos desde localStorage
   */
  private loadMovements(): void {
    const raw = this.storage.getItem(this.MOVEMENTS_KEY);
    if (!raw) {
      this.movementsSignal.set([]);
      return;
    }
    
    try {
      const movements = JSON.parse(raw) as InventoryMovement[];
      // Convertir fechas de string a Date
      const parsedMovements = movements.map((m: InventoryMovement) => ({
        ...m,
        date: new Date(m.date)
      }));
      this.movementsSignal.set(parsedMovements);
    } catch (error) {
      console.error('Error parsing movements:', error);
      this.movementsSignal.set([]);
    }
  }
  
  /**
   * Guardar movimientos en localStorage
   */
  private saveMovements(): void {
    this.storage.setItem(this.MOVEMENTS_KEY, JSON.stringify(this.movementsSignal()));
  }
  
  /**
   * Cargar alertas desde localStorage
   */
  private loadAlerts(): void {
    const raw = this.storage.getItem(this.ALERTS_KEY);
    if (!raw) {
      this.alertsSignal.set([]);
      return;
    }
    
    try {
      const alerts = JSON.parse(raw) as StockAlert[];
      const parsedAlerts = alerts.map((a: StockAlert) => ({
        ...a,
        date: new Date(a.date)
      }));
      this.alertsSignal.set(parsedAlerts);
    } catch (error) {
      console.error('Error parsing alerts:', error);
      this.alertsSignal.set([]);
    }
  }
  
  /**
   * Guardar alertas en localStorage
   */
  private saveAlerts(): void {
    this.storage.setItem(this.ALERTS_KEY, JSON.stringify(this.alertsSignal()));
  }
  
  /**
   * Registrar un movimiento de inventario
   */
  private registerMovement(
    product: Product,
    type: MovementType,
    quantity: number,
    orderId?: string,
    notes?: string
  ): void {
    const movement: InventoryMovement = {
      id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      type,
      quantity,
      previousStock: product.stockCount || 0,
      newStock: (product.stockCount || 0) + quantity,
      date: new Date(),
      orderId,
      notes
    };
    
    this.movementsSignal.update(movements => [movement, ...movements]);
    this.saveMovements();
  }
  
  /**
   * Actualizar stock de un producto (venta)
   */
  decreaseStock(product: Product, quantity: number, orderId?: string): Product {
    const currentStock = product.stockCount || 0;
    const newStock = Math.max(0, currentStock - quantity);
    
    // Registrar movimiento
    this.registerMovement(product, 'sale', -quantity, orderId, `Venta de ${quantity} unidades`);
    
    // Actualizar producto
    const updatedProduct = {
      ...product,
      stockCount: newStock,
      inStock: newStock > 0
    };
    
    // Verificar alertas
    this.checkStockAlert(updatedProduct);
    
    return updatedProduct;
  }
  
  /**
   * Aumentar stock (reabastecimiento)
   */
  increaseStock(product: Product, quantity: number, notes?: string): Product {
    const currentStock = product.stockCount || 0;
    const newStock = currentStock + quantity;
    
    // Registrar movimiento
    this.registerMovement(product, 'restock', quantity, undefined, notes || `Reabastecimiento de ${quantity} unidades`);
    
    // Actualizar producto
    const updatedProduct = {
      ...product,
      stockCount: newStock,
      inStock: true,
      lastRestocked: new Date()
    };
    
    // Eliminar alerta si existe
    this.removeAlert(product.id);
    
    return updatedProduct;
  }
  
  /**
   * Ajustar stock manualmente
   */
  adjustStock(product: Product, newStock: number, notes: string): Product {
    const currentStock = product.stockCount || 0;
    const difference = newStock - currentStock;
    
    // Registrar movimiento
    this.registerMovement(product, 'adjustment', difference, undefined, notes);
    
    // Actualizar producto
    const updatedProduct = {
      ...product,
      stockCount: newStock,
      inStock: newStock > 0
    };
    
    // Verificar alertas
    if (newStock > 0) {
      this.removeAlert(product.id);
    } else {
      this.checkStockAlert(updatedProduct);
    }
    
    return updatedProduct;
  }
  
  /**
   * Registrar devolución
   */
  returnStock(product: Product, quantity: number, orderId: string): Product {
    const currentStock = product.stockCount || 0;
    const newStock = currentStock + quantity;
    
    // Registrar movimiento
    this.registerMovement(product, 'return', quantity, orderId, `Devolución de ${quantity} unidades`);
    
    // Actualizar producto
    const updatedProduct = {
      ...product,
      stockCount: newStock,
      inStock: true
    };
    
    // Eliminar alerta si existe
    this.removeAlert(product.id);
    
    return updatedProduct;
  }
  
  /**
   * Verificar y generar alerta de stock bajo
   */
  checkStockAlert(product: Product): void {
    const currentStock = product.stockCount || 0;
    const minStock = product.minStock || 5; // Default 5 unidades
    
    let severity: 'low' | 'critical' | 'out';
    
    if (currentStock === 0) {
      severity = 'out';
    } else if (currentStock <= minStock / 2) {
      severity = 'critical';
    } else if (currentStock <= minStock) {
      severity = 'low';
    } else {
      // Stock normal, eliminar alerta si existe
      this.removeAlert(product.id);
      return;
    }
    
    // Crear o actualizar alerta
    const existingAlertIndex = this.alertsSignal().findIndex(a => a.productId === product.id);
    
    const alert: StockAlert = {
      productId: product.id,
      productName: product.name,
      currentStock,
      minStock,
      severity,
      date: new Date()
    };
    
    if (existingAlertIndex >= 0) {
      // Actualizar alerta existente
      this.alertsSignal.update(alerts => 
        alerts.map((a, i) => i === existingAlertIndex ? alert : a)
      );
    } else {
      // Crear nueva alerta
      this.alertsSignal.update(alerts => [alert, ...alerts]);
    }
    
    this.saveAlerts();
  }
  
  /**
   * Eliminar alerta de un producto
   */
  removeAlert(productId: string): void {
    this.alertsSignal.update(alerts => alerts.filter(a => a.productId !== productId));
    this.saveAlerts();
  }
  
  /**
   * Obtener movimientos de un producto específico
   */
  getProductMovements(productId: string): InventoryMovement[] {
    return this.movementsSignal().filter(m => m.productId === productId);
  }
  
  /**
   * Obtener movimientos por tipo
   */
  getMovementsByType(type: MovementType): InventoryMovement[] {
    return this.movementsSignal().filter(m => m.type === type);
  }
  
  /**
   * Obtener movimientos recientes
   */
  getRecentMovements(limit: number = 10): InventoryMovement[] {
    return this.movementsSignal().slice(0, limit);
  }
  
  /**
   * Limpiar movimientos antiguos (más de 90 días)
   */
  cleanOldMovements(): void {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    this.movementsSignal.update(movements =>
      movements.filter(m => m.date > ninetyDaysAgo)
    );
    this.saveMovements();
  }
  
  /**
   * Obtener estadísticas de inventario
   */
  getInventoryStats() {
    const movements = this.movementsSignal();
    const alerts = this.alertsSignal();
    
    // Contar ventas del último mes
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentSales = movements.filter(m => 
      m.type === 'sale' && m.date > lastMonth
    );
    
    const totalSales = recentSales.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    return {
      totalMovements: movements.length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'out').length,
      recentSales: totalSales,
      lowStockProducts: alerts.filter(a => a.severity === 'low').length,
      outOfStockProducts: alerts.filter(a => a.severity === 'out').length
    };
  }
}
