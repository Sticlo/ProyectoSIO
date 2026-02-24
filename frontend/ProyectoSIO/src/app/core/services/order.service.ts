import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { CartItem } from './cart.service';
import { ApiService } from './api.service';

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

function fromApi(raw: any): Order {
  return {
    id: String(raw.id),
    phoneNumber: raw.phone_number || '',
    customerName: raw.customer_name || undefined,
    customerAddress: raw.customer_address || undefined,
    items: (raw.items || []).map((i: any) => ({
      productId: String(i.product_id || ''),
      name: i.product_name || i.name || '',
      price: Number(i.price),
      quantity: Number(i.quantity),
      image: i.image || undefined,
      category: undefined
    })),
    total: Number(raw.total),
    shippingCost: Number(raw.shipping_cost) || 0,
    date: new Date(raw.date || raw.created_at),
    status: raw.status as Order['status'],
    notes: raw.notes || undefined,
    viewed: Boolean(raw.viewed)
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = inject(ApiService);

  private _orders = signal<Order[]>([]);
  readonly isLoading = signal(false);

  orders = computed(() => this._orders());

  pendingOrders = computed(() =>
    this._orders().filter(o => o.status === 'pending')
  );

  unreadOrders = computed(() =>
    this._orders().filter(o => !o.viewed)
  );

  stats = computed(() => this.calculateStats());

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.api.get<{ count: number; orders: any[] }>('/orders').subscribe({
      next: (res) => {
        this._orders.set(res.orders.map(fromApi));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar Ã³rdenes:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Crear nueva orden â†’ POST /api/orders
   */
  createOrder(
    phoneNumber: string,
    items: CartItem[],
    total: number,
    shippingCost: number = 0,
    customerName?: string,
    customerAddress?: string,
    notes?: string
  ): Observable<Order> {
    return this.api.post<{ message: string; order: any }>('/orders', {
      phoneNumber,
      items,
      total,
      shippingCost,
      customerName,
      customerAddress,
      notes,
      status: 'pending'
    }).pipe(
      map(res => fromApi(res.order)),
      tap(order => this._orders.update(list => [order, ...list]))
    );
  }

  /**
   * Actualizar estado â†’ PATCH /api/orders/:id/status
   */
  updateOrderStatus(orderId: string, status: Order['status']): Observable<Order> {
    return this.api.patch<{ message: string; order: any }>(
      `/orders/${orderId}/status`, { status }
    ).pipe(
      map(res => fromApi(res.order)),
      tap(updated => this._orders.update(list =>
        list.map(o => o.id === orderId ? updated : o)
      ))
    );
  }

  /**
   * Marcar como vista â†’ PATCH /api/orders/:id/viewed
   */
  markAsViewed(orderId: string): void {
    this.api.patch<any>(`/orders/${orderId}/viewed`, {}).subscribe({
      next: () => {
        this._orders.update(list =>
          list.map(o => o.id === orderId ? { ...o, viewed: true } : o)
        );
      },
      error: err => console.error('Error al marcar como vista:', err)
    });
  }

  /**
   * Actualizar info del cliente â†’ PUT /api/orders/:id
   */
  updateCustomerInfo(
    orderId: string,
    customerName: string,
    notes?: string,
    customerAddress?: string
  ): Observable<Order> {
    return this.api.put<{ message: string; order: any }>(`/orders/${orderId}`, {
      customerName, notes, customerAddress
    }).pipe(
      map(res => fromApi(res.order)),
      tap(updated => this._orders.update(list =>
        list.map(o => o.id === orderId ? updated : o)
      ))
    );
  }

  /**
   * Eliminar orden â†’ DELETE /api/orders/:id
   */
  deleteOrder(orderId: string): Observable<void> {
    return this.api.delete<{ message: string }>(`/orders/${orderId}`).pipe(
      tap(() => this._orders.update(list => list.filter(o => o.id !== orderId))),
      map(() => void 0)
    );
  }

  /**
   * Eliminar todas las Ã³rdenes de un telÃ©fono
   */
  deletePhoneNumber(phoneNumber: string): void {
    const toDelete = this._orders().filter(o => o.phoneNumber === phoneNumber);
    // Optimistic update primero
    this._orders.update(list => list.filter(o => o.phoneNumber !== phoneNumber));
    // Luego borrar en el backend
    toDelete.forEach(order => {
      this.api.delete(`/orders/${order.id}`).subscribe({
        error: err => console.error('Error al eliminar orden:', err)
      });
    });
  }

  getOrdersByPhone(phoneNumber: string): Order[] {
    return this._orders().filter(o => o.phoneNumber === phoneNumber);
  }

  getUniquePhoneNumbers(): string[] {
    const phones = new Set(this._orders().map(o => o.phoneNumber));
    return Array.from(phones);
  }

  private calculateStats(): OrderStats {
    const orders = this._orders();
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = completedOrders.length > 0
      ? totalRevenue / completedOrders.length : 0;
    const uniquePhones = new Set(orders.map(o => o.phoneNumber));

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

  clearAllOrders(): void {
    this._orders.set([]);
  }
}
