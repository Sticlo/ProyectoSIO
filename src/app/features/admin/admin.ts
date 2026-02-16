import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  products = computed(() => this.productService.allProducts());
  user = computed(() => this.authService.user());
  
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  searchQuery = signal('');
  
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
    public router: Router
  ) {}
  
  openCreateModal(): void {
    this.editingProduct.set(null);
    this.formData.set({
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
    this.showModal.set(true);
  }
  
  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.formData.set({ ...product });
    this.showModal.set(true);
  }
  
  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }
  
  saveProduct(): void {
    const data = this.formData();
    
    // Validaciones básicas
    if (!data.name || !data.category || !data.description || !data.price) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    if (this.editingProduct()) {
      // Actualizar
      this.productService.update(this.editingProduct()!.id, data);
    } else {
      // Crear
      this.productService.create(data as Omit<Product, 'id'>);
    }
    
    this.closeModal();
  }
  
  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.delete(id);
    }
  }
  
  updateField<K extends keyof Product>(field: K, value: Product[K]): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
  
  logout(): void {
    this.authService.logout();
  }
}
