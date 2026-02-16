import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent, Product } from '../../shared/components/product-card/product-card.component';

type SortOption = 'relevant' | 'price-asc' | 'price-desc' | 'name' | 'rating';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-productos',
  imports: [ProductCardComponent, CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class Productos {
  // Estados de filtros y búsqueda
  searchQuery = signal('');
  selectedCategories = signal<string[]>([]);
  priceRange = signal({ min: 0, max: 1000 });
  minRating = signal(0);
  sortBy = signal<SortOption>('relevant');
  viewMode = signal<ViewMode>('grid');
  showFilters = signal(true);

  // Categorías disponibles
  categories = [
    { id: 'auriculares', name: 'Auriculares', count: 0 },
    { id: 'bocinas', name: 'Bocinas', count: 0 },
    { id: 'smartwatch', name: 'Smartwatch', count: 0 },
    { id: 'cargadores', name: 'Cargadores', count: 0 },
    { id: 'almacenamiento', name: 'Almacenamiento', count: 0 },
    { id: 'accesorios', name: 'Accesorios', count: 0 }
  ];

  // Todos los productos disponibles
  allProducts: Product[] = [
    {
      id: '1',
      name: 'AirBuds Pro Max',
      category: 'AURICULARES',
      description: 'Sonido premium con cancelación de ruido activa y 40 horas de batería.',
      price: 199,
      originalPrice: 249,
      rating: 4.8,
      reviewCount: 1542,
      badge: 'Oferta'
    },
    {
      id: '2',
      name: 'SoundPulse Speaker',
      category: 'BOCINAS',
      description: 'Potencia y claridad en un diseño compacto resistente al agua.',
      price: 149,
      rating: 4.7,
      reviewCount: 892
    },
    {
      id: '3',
      name: 'ChronoWave Watch',
      category: 'SMARTWATCH',
      description: 'Elegancia inteligente con monitoreo de salud 24/7.',
      price: 299,
      originalPrice: 349,
      rating: 4.9,
      reviewCount: 2103,
      badge: 'Popular'
    },
    {
      id: '4',
      name: 'ChargeHub Wireless',
      category: 'CARGADORES',
      description: 'Carga rápida inalámbrica de última generación para 3 dispositivos.',
      price: 89,
      rating: 4.6,
      reviewCount: 654,
      badge: 'Nuevo'
    },
    {
      id: '5',
      name: 'SoundWave Elite',
      category: 'AURICULARES',
      description: 'Diseño premium con audio de alta fidelidad y controles táctiles.',
      price: 279,
      rating: 4.8,
      reviewCount: 1876
    },
    {
      id: '6',
      name: 'FlashDrive Pro',
      category: 'ALMACENAMIENTO',
      description: 'Velocidad de transferencia ultrarrápida en diseño compacto.',
      price: 129,
      originalPrice: 159,
      rating: 4.7,
      reviewCount: 743
    },
    {
      id: '7',
      name: 'BassBoost Speaker',
      category: 'BOCINAS',
      description: 'Graves profundos y sonido envolvente 360 grados.',
      price: 189,
      rating: 4.6,
      reviewCount: 432
    },
    {
      id: '8',
      name: 'TechPod Case',
      category: 'ACCESORIOS',
      description: 'Protección premium con diseño minimalista y elegante.',
      price: 49,
      originalPrice: 69,
      rating: 4.5,
      reviewCount: 876,
      badge: 'Exclusivo'
    },
    {
      id: '9',
      name: 'PowerBank Ultra',
      category: 'CARGADORES',
      description: 'Batería portátil de 20000mAh con carga rápida.',
      price: 79,
      rating: 4.7,
      reviewCount: 1234
    },
    {
      id: '10',
      name: 'Studio Headphones',
      category: 'AURICULARES',
      description: 'Calidad de estudio profesional para músicos y productores.',
      price: 399,
      originalPrice: 499,
      rating: 4.9,
      reviewCount: 567,
      badge: 'Pro'
    },
    {
      id: '11',
      name: 'MiniSpeaker Pocket',
      category: 'BOCINAS',
      description: 'Sonido potente en tamaño de bolsillo, ideal para viajes.',
      price: 59,
      rating: 4.4,
      reviewCount: 892
    },
    {
      id: '12',
      name: 'FitWatch Pro',
      category: 'SMARTWATCH',
      description: 'Reloj deportivo con GPS y métricas avanzadas de entrenamiento.',
      price: 249,
      rating: 4.6,
      reviewCount: 1098
    }
  ];

  // Productos filtrados (computed)
  filteredProducts = computed(() => {
    let products = [...this.allProducts];
    
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

  // Contador de productos por categoría
  constructor() {
    this.updateCategoryCounts();
  }

  updateCategoryCounts() {
    this.categories.forEach(cat => {
      cat.count = this.allProducts.filter(p => 
        p.category?.toLowerCase() === cat.id
      ).length;
    });
  }

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
    this.showFilters.update(v => !v);
  }

  // Utilidad
  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
