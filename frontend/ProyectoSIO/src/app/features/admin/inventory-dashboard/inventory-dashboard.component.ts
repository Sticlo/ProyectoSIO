import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryMovement } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { ReportService } from '../../../core/services/report.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss']
})
export class InventoryDashboardComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly productService = inject(ProductService);
  private readonly reportService = inject(ReportService);
  
  // State
  isOpen = signal(false);
  selectedProduct = signal<Product | null>(null);
  filterType = signal<'all' | 'low' | 'out' | 'normal'>('all');
  searchQuery = signal('');
  
  // Configuración de reabastecimiento
  restockQuantity = signal(0);
  restockNotes = signal('');
  
  // Data from services
  alerts = this.inventoryService.alerts;
  movements = this.inventoryService.movements;
  allProducts = this.productService.allProducts;
  
  // Computed values
  stats = computed(() => this.inventoryService.getInventoryStats());
  
  recentMovements = computed(() => 
    this.inventoryService.getRecentMovements(10)
  );
  
  filteredProducts = computed(() => {
    let products = this.allProducts();
    const query = this.searchQuery().toLowerCase();
    const filter = this.filterType();
    
    // Filtrar por búsqueda
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.category?.toLowerCase().includes(query) || false)
      );
    }
    
    // Filtrar por tipo
    if (filter === 'low') {
      products = this.productService.getLowStockProducts();
    } else if (filter === 'out') {
      products = this.productService.getOutOfStockProducts();
    } else if (filter === 'normal') {
      products = products.filter(p => {
        const stock = p.stockCount || 0;
        return stock > 0;
      });
    }
    
    return products;
  });
  
  open(): void {
    this.isOpen.set(true);
  }
  
  close(): void {
    this.isOpen.set(false);
    this.selectedProduct.set(null);
  }
  
  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.restockQuantity.set(0);
    this.restockNotes.set('');
  }
  
  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }
  
  /**
   * Reabastecer producto — persiste en la BD
   */
  restockProduct(): void {
    const product = this.selectedProduct();
    const quantity = this.restockQuantity();
    const notes = this.restockNotes();

    if (!product || quantity <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    // Registrar movimiento a través del backend (guarda movimiento + actualiza stock)
    this.inventoryService.increaseStock(
      product,
      quantity,
      notes || `Reabastecimiento de ${quantity} unidades`
    ).subscribe({
      next: updatedProduct => {
        this.selectedProduct.set(updatedProduct);
        this.restockQuantity.set(0);
        this.restockNotes.set('');
      },
      error: err => {
        console.error('Error al reabastecer stock:', err);
        alert('No se pudo reabastecer el stock. Verifica la conexión.');
      }
    });
  }
  
  /**
   * Ajustar stock manualmente — persiste en la BD
   */
  adjustStock(product: Product, newStock: number): void {
    const notes = prompt('Motivo del ajuste:', 'Ajuste manual de inventario');
    if (notes === null) return; // Cancelado

    // Registrar ajuste a través del backend (guarda movimiento + actualiza stock)
    this.inventoryService.adjustStock(product, newStock, notes).subscribe({
      next: updatedProduct => {
        if (this.selectedProduct()?.id === product.id) {
          this.selectedProduct.set(updatedProduct);
        }
      },
      error: err => {
        console.error('Error al ajustar stock:', err);
        alert('No se pudo ajustar el stock. Verifica la conexión.');
      }
    });
  }
  
  /**
   * Obtener movimientos de un producto
   */
  getProductMovements(productId: string): InventoryMovement[] {
    return this.inventoryService.getProductMovements(productId);
  }
  
  /**
   * Obtener severidad de alerta para un producto
   */
  getProductSeverity(product: Product): 'low' | 'critical' | 'out' | 'normal' {
    const alert = this.alerts().find(a => a.productId === product.id);
    if (alert) return alert.severity;
    
    const stock = product.stockCount || 0;
    if (stock === 0) return 'out';
    
    return 'normal';
  }
  
  /**
   * Formatear fecha
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  /**
   * Obtener etiqueta de tipo de movimiento
   */
  getMovementTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      sale: 'Venta',
      restock: 'Reabastecimiento',
      adjustment: 'Ajuste',
      return: 'Devolución'
    };
    return labels[type] || type;
  }
  
  /**
   * Obtener color de tipo de movimiento
   */
  getMovementTypeColor(type: string): string {
    const colors: Record<string, string> = {
      sale: 'danger',
      restock: 'success',
      adjustment: 'warning',
      return: 'info'
    };
    return colors[type] || 'default';
  }
  
  /**
   * Obtener icono según severidad
   */
  getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      out: '🔴',
      critical: '🟠',
      low: '🟡',
      normal: '🟢'
    };
    return icons[severity] || '⚪';
  }
  
  /**
   * Obtener etiqueta de severidad
   */
  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      out: 'Agotado',
      critical: 'Crítico',
      low: 'Stock Bajo',
      normal: 'Normal'
    };
    return labels[severity] || severity;
  }
  
  /**
   * Generar reporte PDF de inventario
   */
  downloadInventoryReport(): void {
    this.reportService.generateInventoryReport();
  }
}
