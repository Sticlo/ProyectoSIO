import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-dashboard.component.html',
  styleUrls: ['./notifications-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationsDashboardComponent {
  notificationService = inject(NotificationService);

  isOpen = signal(false);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  isLoading = this.notificationService.isLoading;

  open(): void {
    console.log('Opening notifications dashboard');
    this.isOpen.set(true);
    console.log('isOpen set to:', this.isOpen());
    this.notificationService.loadNotifications();
  }

  close(): void {
    console.log('Closing notifications dashboard');
    this.isOpen.set(false);
    console.log('isOpen set to:', this.isOpen());
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(id: number): void {
    this.notificationService.delete(id).subscribe();
  }

  getTypeLabel(type: Notification['type']): string {
    return this.notificationService.getTypeLabel(type);
  }

  getTypeColor(type: Notification['type']): string {
    return this.notificationService.getTypeColor(type);
  }

  getTypeIcon(type: Notification['type']): string {
    const icons: Record<Notification['type'], string> = {
      failed_sale: '🚫',
      new_order: '🛍️',
      low_stock: '⚠️',
      comment: '💬'
    };
    return icons[type] ?? '🔔';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
