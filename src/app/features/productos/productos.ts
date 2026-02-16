import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../core/services/product.service';

type SortOption = 'relevant' | 'price-asc' | 'price-desc' | 'name' | 'rating';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-productos',
  imports: [ProductCardComponent, CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class Productos {
  // Servicios
  private productService = inject(ProductService);
  
  // Estados de filtros y búsqueda
  searchQuery = signal('');
  selectedCategories = signal<string[]>([]);
  priceRange = signal({ min: 0, max: 1000 });
  minRating = signal(0);
  sortBy = signal<SortOption>('relevant');
  viewMode = signal<ViewMode>('grid');
  showFilters = signal(false); // Empezar cerrado, especialmente en móvil

  constructor() {
    // Effect para prevenir scroll cuando el sidebar está abierto en móvil
    effect(() => {
      if (typeof window !== 'undefined') {
        if (this.showFilters() && window.innerWidth <= 968) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  // Todos los productos vienen del servicio
  allProducts = this.productService.allProducts;

  // Categorías dinámicas basadas en los productos
  categories = computed(() => {
    const categoryMap = new Map<string, number>();
    const products = this.allProducts();
    
    products.forEach(p => {
      if (p.category) {
        const count = categoryMap.get(p.category) || 0;
        categoryMap.set(p.category, count + 1);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([id, count]) => ({
      id: id.toLowerCase(),
      name: id,
      count
    }));
  });

  // Productos filtrados (computed)
  filteredProducts = computed(() => {
    let products = [...this.allProducts()];
    
    // Filtro de búsqueda
    const query = this.searchQuery().toLowerCase();
    if (query) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.category?.toLowerCase().includes(query) || false)
      );
    }
    
    // Filtro de categorías
    const selectedCats = this.selectedCategories();
    if (selectedCats.length > 0) {
      products = products.filter(p => 
        p.category && selectedCats.includes(p.category.toLowerCase())
      );
    }
    
    // Filtro de precio
    const range = this.priceRange();
    products = products.filter(p => 
      p.price >= range.min && p.price <= range.max
    );
    
    // Filtro de rating
    const minRate = this.minRating();
    if (minRate > 0) {
      products = products.filter(p => 
        (p.rating || 0) >= minRate
      );
    }
    
    // Ordenamiento
    const sort = this.sortBy();
    switch(sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
    
    return products;
  });

  // Métodos de filtrado
  toggleCategory(categoryId: string) {
    this.selectedCategories.update(cats => {
      if (cats.includes(categoryId)) {
        return cats.filter(c => c !== categoryId);
      }
      return [...cats, categoryId];
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.priceRange.set({ min: 0, max: 1000 });
    this.minRating.set(0);
  }

  toggleFilters() {
    this.showFilters.update(show => !show);
  }
  
  closeSidebar() {
    this.showFilters.set(false);
  }

  // Utilidad
  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
