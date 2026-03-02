import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { StorageService } from './storage.service';
import { Product } from '../../shared/models/product.model';
import { environment } from '@environments/environment';

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
  severity: 'low' | 'critical' | 'out';
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly MOVEMENTS_KEY = 'inventory_movements';
  private readonly ALERTS_KEY = 'stock_alerts';
  private readonly apiUrl = environment.apiUrl;
  
  // Signals
  private readonly movementsSignal = signal<InventoryMovement[]>([]);
  private readonly alertsSignal = signal<StockAlert[]>([]);
  
  // Computed values
  movements = this.movementsSignal.asReadonly();
  alerts = this.alertsSignal.asReadonly();
  
  activeAlerts = computed(() => 
    this.alertsSignal().filter(alert => 
      alert.severity === 'critical' || alert.severity === 'out'
    )
  );
  
  constructor() {
    this.loadAlerts();
    this.loadMovementsFromAPI();
  }
  
  /**
   * Cargar movimientos desde el backend API
   */
  loadMovementsFromAPI(): void {
    this.http.get<{ movements: any[] }>(`${this.apiUrl}/inventory/movements`).pipe(
      map(response => response.movements.map((m: any) => ({
        id: m.id.toString(),
        productId: m.product_id.toString(),
        productName: m.product_name || 'Producto',
        type: this.mapBackendTypeToFrontend(m.type),
        quantity: m.quantity,
        previousStock: 0, // No disponible desde backend
        newStock: m.new_stock || 0,
        date: new Date(m.created_at),
        orderId: m.order_id?.toString(),
        notes: m.notes || m.reason
      }))),
      catchError(error => {
        console.error('Error loading movements from API:', error);
        return of([]);
      })
    ).subscribe(movements => {
      this.movementsSignal.set(movements);
    });
  }
  
  /**
   * Mapear tipo de backend (in/out) a tipo frontend (sale/restock/adjustment/return)
   */
  private mapBackendTypeToFrontend(type: string): MovementType {
    // El backend usa 'in' o 'out', el frontend usa tipos más específicos
    // Por ahora mapeamos 'in' a 'restock' y 'out' a 'sale'
    // El campo 'reason' podría dar más contexto
    return type === 'in' ? 'restock' : 'sale';
  }
  
  /**
   * Mapear tipo frontend a tipo backend
   */
  private mapFrontendTypeToBackend(type: MovementType): 'in' | 'out' {
    return (type === 'restock' || type === 'return') ? 'in' : 'out';
  }
  
  /**
   * Registrar un movimiento de inventario en el backend
   */
  private registerMovement(
    product: Product,
    type: MovementType,
    quantity: number,
    orderId?: string,
    notes?: string
  ): Observable<any> {
    const backendType = this.mapFrontendTypeToBackend(type);
    const adjustQuantity = Math.abs(quantity); // Backend espera cantidad positiva
    
    return this.http.post<any>(`${this.apiUrl}/inventory/adjust`, {
      productId: product.id,
      quantity: adjustQuantity,
      type: backendType,
      reason: type,
      notes: notes || `${type} - ${adjustQuantity} unidades`
    }).pipe(
      tap(() => {
        // Recargar movimientos después de registrar uno nuevo
        this.loadMovementsFromAPI();
      }),
      catchError(error => {
        console.error('Error registering movement:', error);
        throw error;
      })
    );
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
   * Actualizar stock de un producto (venta)
   */
  decreaseStock(product: Product, quantity: number, orderId?: string): Observable<Product> {
    return this.registerMovement(product, 'sale', -quantity, orderId, `Venta de ${quantity} unidades`).pipe(
      map(response => {
        const currentStock = product.stockCount || 0;
        const newStock = Math.max(0, currentStock - quantity);
        
        const updatedProduct: Product = {
          ...product,
          stockCount: newStock,
          inStock: newStock > 0
        };
        
        // Verificar alertas localmente
        this.checkStockAlert(updatedProduct);
        
        return updatedProduct;
      })
    );
  }
  
  /**
   * Aumentar stock (reabastecimiento)
   */
  increaseStock(product: Product, quantity: number, notes?: string): Observable<Product> {
    return this.registerMovement(product, 'restock', quantity, undefined, notes || `Reabastecimiento de ${quantity} unidades`).pipe(
      map(response => {
        const currentStock = product.stockCount || 0;
        const newStock = currentStock + quantity;
        
        const updatedProduct: Product = {
          ...product,
          stockCount: newStock,
          inStock: true,
          lastRestocked: new Date()
        };
        
        // Eliminar alerta si existe
        this.removeAlert(product.id);
        
        return updatedProduct;
      })
    );
  }
  
  /**
   * Ajustar stock manualmente
   */
  adjustStock(product: Product, newStock: number, notes: string): Observable<Product> {
    const currentStock = product.stockCount || 0;
    const difference = newStock - currentStock;
    
    return this.registerMovement(product, 'adjustment', difference, undefined, notes).pipe(
      map(response => {
        const updatedProduct: Product = {
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
      })
    );
  }
  
  /**
   * Registrar devolución
   */
  returnStock(product: Product, quantity: number, orderId: string): Observable<Product> {
    return this.registerMovement(product, 'return', quantity, orderId, `Devolución de ${quantity} unidades`).pipe(
      map(response => {
        const currentStock = product.stockCount || 0;
        const newStock = currentStock + quantity;
        
        const updatedProduct: Product = {
          ...product,
          stockCount: newStock,
          inStock: true
        };
        
        // Eliminar alerta si existe
        this.removeAlert(product.id);
        
        return updatedProduct;
      })
    );
  }
  
  /**
   * Verificar y generar alerta de stock bajo
   * Umbrales: crítico <= 5, bajo <= 10, agotado = 0
   */
  checkStockAlert(product: Product): void {
    const currentStock = product.stockCount || 0;
    const LOW_STOCK_THRESHOLD = 10;
    const CRITICAL_STOCK_THRESHOLD = 5;
    
    let severity: 'low' | 'critical' | 'out';
    
    if (currentStock === 0) {
      severity = 'out';
    } else if (currentStock <= CRITICAL_STOCK_THRESHOLD) {
      severity = 'critical';
    } else if (currentStock <= LOW_STOCK_THRESHOLD) {
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
