import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface Notification {
  id: number;
  type: 'failed_sale' | 'new_order' | 'low_stock' | 'comment';
  title: string;
  message: string | null;
  data: any;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);

  private _notifications = signal<Notification[]>([]);
  readonly isLoading = signal(false);

  notifications = computed(() => this._notifications());
  unreadCount = computed(() => this._notifications().filter(n => !n.is_read).length);
  unreadNotifications = computed(() => this._notifications().filter(n => !n.is_read));

  constructor() {
    this.loadNotifications();
  }

  loadNotifications(onlyUnread = false): void {
    this.isLoading.set(true);
    this.api.get<{ count: number; unreadCount: number; notifications: Notification[] }>(
      `/notifications${onlyUnread ? '?unread=true' : ''}`
    ).subscribe({
      next: res => {
        this._notifications.set(res.notifications);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Error al cargar notificaciones:', err);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: number): Observable<{ notification: Notification }> {
    return this.api.patch<{ notification: Notification }>(`/notifications/${id}/read`, {}).pipe(
      tap(res => {
        this._notifications.update(list =>
          list.map(n => n.id === id ? { ...n, is_read: true, read_at: res.notification.read_at } : n)
        );
      })
    );
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/notifications/mark-all-read', {}).pipe(
      tap(() => {
        this._notifications.update(list =>
          list.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
      })
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/notifications/${id}`).pipe(
      tap(() => {
        this._notifications.update(list => list.filter(n => n.id !== id));
      })
    );
  }

  /** Etiquetas legibles para los tipos */
  getTypeLabel(type: Notification['type']): string {
    const labels: Record<Notification['type'], string> = {
      failed_sale: 'Venta Fallida',
      new_order: 'Nuevo Pedido',
      low_stock: 'Stock Bajo',
      comment: 'Comentario'
    };
    return labels[type] ?? type;
  }

  getTypeColor(type: Notification['type']): string {
    const colors: Record<Notification['type'], string> = {
      failed_sale: '#e74c3c',
      new_order: '#27ae60',
      low_stock: '#f39c12',
      comment: '#3498db'
    };
    return colors[type] ?? '#86868b';
  }
}
