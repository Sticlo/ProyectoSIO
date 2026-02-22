import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { CartItem } from './cart.service';

export interface Order {
  id: string;
  phoneNumber: string;
  customerName?: string;
  customerAddress?: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-response';
  notes?: string;
  viewed: boolean;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  topProducts: { name: string; count: number; revenue: number }[];
  recentOrders: Order[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly STORAGE_KEY = 'whatsapp_orders';
  private ordersSignal = signal<Order[]>([]);

  // Computed values
  orders = computed(() => this.ordersSignal());
  
  pendingOrders = computed(() => 
    this.ordersSignal().filter(o => o.status === 'pending')
  );
  
  unreadOrders = computed(() => 
    this.ordersSignal().filter(o => !o.viewed)
  );
  
  stats = computed(() => this.calculateStats());

  constructor(private storageService: StorageService) {
    this.loadOrders();
  }

  private loadOrders(): void {
    const stored = this.storageService.getLocal(this.STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      // Convertir las fechas de string a Date
      const orders = stored.map(o => ({
        ...o,
        date: new Date(o.date)
      }));
      this.ordersSignal.set(orders);
    }
  }

  private saveOrders(): void {
    this.storageService.setLocal(this.STORAGE_KEY, this.ordersSignal());
  }

  /**
   * Crear una nueva orden desde el carrito
   */
  createOrder(phoneNumber: string, items: CartItem[], total: number, shippingCost: number = 0): Order {
    const order: Order = {
      id: this.generateOrderId(),
      phoneNumber,
      items: [...items],
      total,
      shippingCost,
      date: new Date(),
      status: 'pending',
      viewed: false
    };

    this.ordersSignal.update(orders => [order, ...orders]);
    this.saveOrders();
    
    return order;
  }

  /**
   * Actualizar el estado de una orden
   */
  updateOrderStatus(orderId: string, status: Order['status']): void {
    this.ordersSignal.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status } : o)
    );
    this.saveOrders();
  }

  /**
   * Marcar orden como vista
   */
  markAsViewed(orderId: string): void {
    this.ordersSignal.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, viewed: true } : o)
    );
    this.saveOrders();
  }

  /**
   * Agregar nombre del cliente a la orden
   */
  updateCustomerInfo(orderId: string, customerName: string, notes?: string, customerAddress?: string): void {
    this.ordersSignal.update(orders =>
      orders.map(o => 
        o.id === orderId 
          ? { ...o, customerName, customerAddress: customerAddress || o.customerAddress, notes: notes || o.notes } 
          : o
      )
    );
    this.saveOrders();
  }

  /**
   * Eliminar una orden (cuando no se concretó la venta)
   */
  deleteOrder(orderId: string): void {
    this.ordersSignal.update(orders => orders.filter(o => o.id !== orderId));
    this.saveOrders();
  }

  /**
   * Eliminar un número de teléfono y todas sus órdenes
   */
  deletePhoneNumber(phoneNumber: string): void {
    this.ordersSignal.update(orders => 
      orders.filter(o => o.phoneNumber !== phoneNumber)
    );
    this.saveOrders();
  }

  /**
   * Obtener órdenes por número de teléfono
   */
  getOrdersByPhone(phoneNumber: string): Order[] {
    return this.ordersSignal().filter(o => o.phoneNumber === phoneNumber);
  }

  /**
   * Obtener números únicos de clientes
   */
  getUniquePhoneNumbers(): string[] {
    const phones = new Set(this.ordersSignal().map(o => o.phoneNumber));
    return Array.from(phones);
  }

  /**
   * Calcular estadísticas
   */
  private calculateStats(): OrderStats {
    const orders = this.ordersSignal();
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Total revenue (solo órdenes completadas)
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Average order value
    const averageOrderValue = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0;
    
    // Unique customers
    const uniquePhones = new Set(orders.map(o => o.phoneNumber));
    
    // Top products
    const productMap = new Map<string, { count: number; revenue: number }>();
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.name) || { count: 0, revenue: 0 };
        productMap.set(item.name, {
          count: existing.count + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        });
      });
    });
    
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Recent orders (últimas 5)
    const recentOrders = [...orders]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
    
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageOrderValue,
      uniqueCustomers: uniquePhones.size,
      topProducts,
      recentOrders
    };
  }

  /**
   * Generar ID único para orden
   */
  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Limpiar todas las órdenes (útil para desarrollo/testing)
   */
  clearAllOrders(): void {
    this.ordersSignal.set([]);
    this.saveOrders();
  }
}
