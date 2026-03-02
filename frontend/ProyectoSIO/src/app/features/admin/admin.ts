import { Component, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ExpenseService } from '../../core/services/expense.service';
import { OrdersDashboardComponent } from './orders-dashboard/orders-dashboard.component';
import { InventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';
import { FinancesDashboardComponent } from './finances-dashboard/finances-dashboard.component';
import { ChatbotComponent } from './chatbot/chatbot';
import { NotificationsDashboardComponent } from './notifications-dashboard/notifications-dashboard.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, OrdersDashboardComponent, InventoryDashboardComponent, FinancesDashboardComponent, ChatbotComponent, NotificationsDashboardComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  products = computed(() => this.productService.allProducts());
  user = computed(() => this.authService.user());
  
  // Orders dashboard
  ordersDashboard = viewChild.required(OrdersDashboardComponent);
  ordersStats = computed(() => this.orderService.stats());
  unreadOrders = computed(() => this.orderService.unreadOrders().length);
  
  // Inventory dashboard
  inventoryDashboard = viewChild.required(InventoryDashboardComponent);
  inventoryStats = computed(() => this.inventoryService.getInventoryStats());
  criticalAlerts = computed(() => this.inventoryService.activeAlerts().length);
  
  // Finances dashboard
  financesDashboard = viewChild.required(FinancesDashboardComponent);
  financialStats = computed(() => this.expenseService.financialStats());

  // QR Mesas

  // Notifications dashboard
  notifsDashboard = viewChild.required(NotificationsDashboardComponent);
  unreadNotifs = computed(() => this.notificationService.unreadCount());
  
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  searchQuery = signal('');
  imagePreview = signal<string | undefined>(undefined);
  
  formData = signal<Partial<Product>>({
    name: '',
    category: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    rating: undefined,
    reviewCount: undefined,
    badge: undefined,
    image: undefined
  });
  
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.products();
    
    return this.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.category?.toLowerCase().includes(query) || false) ||
      p.description.toLowerCase().includes(query)
    );
  });
  
  categories = ['AURICULARES', 'BOCINAS', 'SMARTWATCH', 'CARGADORES', 'ALMACENAMIENTO', 'ACCESORIOS'];
  badges = ['Nuevo', 'Oferta', 'Popular', 'Exclusivo', 'Pro'];
  
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    public router: Router
  ) {}
  
  openCreateModal(): void {
    this.editingProduct.set(null);
    this.formData.set({
      name: '', category: '', description: '', price: 0,
      originalPrice: undefined, rating: undefined, reviewCount: undefined,
      badge: undefined, image: undefined
    });
    this.imagePreview.set(undefined);
    this.showModal.set(true);
  }
  
  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.formData.set({ ...product });
    this.imagePreview.set(product.image);
    this.showModal.set(true);
  }
  
  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }
  
  saveProduct(): void {
    const data = this.formData();
    if (!data.name || !data.category || !data.description || !data.price) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    if (this.editingProduct()) {
      this.productService.update(this.editingProduct()!.id, data).subscribe({
        next: () => this.closeModal(),
        error: (err) => { console.error(err); alert('Error al actualizar el producto.'); }
      });
    } else {
      this.productService.create(data).subscribe({
        next: () => this.closeModal(),
        error: (err) => { console.error(err); alert('Error al crear el producto.'); }
      });
    }
  }
  
  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.delete(id).subscribe({
        error: (err) => { console.error(err); alert('Error al eliminar el producto.'); }
      });
    }
  }
  
  updateField<K extends keyof Product>(field: K, value: Product[K]): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    // Validar tamaño máximo (5MB para archivo original)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }
    
    // Comprimir y convertir a base64
    this.compressImage(file, (base64) => {
      this.imagePreview.set(base64);
      this.updateField('image', base64);
    });
  }

  compressImage(file: File, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calcular nuevas dimensiones (máximo 1200px en el lado más largo)
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con compresión (0.8 de calidad para JPEG)
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log(`🖼️  Imagen comprimida: ${Math.round(file.size / 1024)}KB → ${Math.round(base64.length * 0.75 / 1024)}KB`);
        callback(base64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview.set(undefined);
    this.updateField('image', undefined);
  }
  
  openOrdersDashboard(): void { this.ordersDashboard().open(); }
  openInventoryDashboard(): void { this.inventoryDashboard().open(); }
  openFinancesDashboard(): void { this.financesDashboard().open(); }
  openNotificationsDashboard(): void { this.notifsDashboard().open(); }
  logout(): void { this.authService.logout(); }
}
