import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../core/services/order.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-orders-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-dashboard.component.html',
  styleUrls: ['./orders-dashboard.component.scss']
})
export class OrdersDashboardComponent {
  private orderService = inject(OrderService);
  private whatsappService = inject(WhatsAppService);
  private reportService = inject(ReportService);
  
  // State
  isOpen = signal(false);
  selectedOrder = signal<Order | null>(null);
  filterStatus = signal<'all' | Order['status']>('all');
  searchQuery = signal('');
  
  // Data from service
  stats = this.orderService.stats;
  allOrders = this.orderService.orders;
  unreadCount = computed(() => this.orderService.unreadOrders().length);
  
  // Filtered orders
  filteredOrders = computed(() => {
    let orders = this.allOrders();
    
    // Filter by status
    const status = this.filterStatus();
    if (status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }
    
    // Filter by search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.phoneNumber.includes(query) ||
        (o.customerName?.toLowerCase().includes(query) || false) ||
        o.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    return orders;
  });
  
  open(): void {
    this.isOpen.set(true);
  }
  
  close(): void {
    this.isOpen.set(false);
    this.selectedOrder.set(null);
  }
  
  selectOrder(order: Order): void {
    this.selectedOrder.set(order);
    if (!order.viewed) {
      this.orderService.markAsViewed(order.id);
    }
  }
  
  closeOrderDetail(): void {
    this.selectedOrder.set(null);
  }
  
  updateStatus(orderId: string, status: Order['status']): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        this.selectedOrder.set(updated);
      },
      error: err => {
        console.error('Error al actualizar estado:', err);
        alert('No se pudo actualizar el estado de la orden.');
      }
    });
  }
  
  deleteOrder(orderId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => this.closeOrderDetail(),
        error: err => {
          console.error('Error al eliminar orden:', err);
          alert('No se pudo eliminar la orden.');
        }
      });
    }
  }
  
  deletePhoneNumber(phoneNumber: string): void {
    const orders = this.orderService.getOrdersByPhone(phoneNumber);
    const message = `¿Eliminar el número ${phoneNumber} y todas sus ${orders.length} orden(es)?`;
    
    if (confirm(message)) {
      this.orderService.deletePhoneNumber(phoneNumber);
      this.closeOrderDetail();
    }
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatPrice(price: number): string {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  getStatusLabel(status: Order['status']): string {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Completado',
      'no-response': 'No respondió'
    };
    return labels[status];
  }
  
  getStatusColor(status: Order['status']): string {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      cancelled: 'danger',
      completed: 'success',
      'no-response': 'grey'
    };
    return colors[status];
  }
  
  /**
   * Enviar recordatorio al cliente
   */
  sendReminder(order: Order): void {
    this.whatsappService.sendReminder(order);
  }
  
  /**
   * Generar reporte PDF de pedidos
   */
  downloadOrdersReport(): void {
    this.reportService.generateOrdersReport();
  }
}
