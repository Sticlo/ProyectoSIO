import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent, Product } from '../../shared/components/product-card/product-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-productos',
  imports: [ProductCardComponent, ButtonComponent, CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class Productos {
  currentSlide = signal(0);
  
  // Producto destacado para hero section
  featuredHero: Product = {
    id: 'hero-1',
    name: 'Sonido que trasciende los sentidos',
    category: 'AURICULARES PREMIUM',
    description: 'Experimenta una claridad de audio sin precedentes con nuestros auriculares insignia. Cancelación de ruido adaptativa, 40 horas de batería y un diseño que define la elegancia.',
    price: 349,
    originalPrice: 449,
    rating: 4.9,
    reviewCount: 2847,
    badge: 'Nuevo',
    image: '/assets/products/headphones-hero.jpg'
  };
  // Productos para el carrusel
  carouselProducts: Product[] = [
    {
      id: '1',
      name: 'AirBuds Pro Max',
      category: 'AURICULARES',
      description: 'Sonido premium con cancelación de ruido activa.',
      price: 199,
      originalPrice: 249,
      rating: 4.8,
      reviewCount: 1542
    },
    {
      id: '2',
      name: 'SoundPulse Speaker',
      category: 'BOCINAS',
      description: 'Potencia y claridad en un diseño compacto.',
      price: 149,
      rating: 4.7,
      reviewCount: 892
    },
    {
      id: '3',
      name: 'ChronoWave Watch',
      category: 'SMARTWATCH',
      description: 'Elegancia inteligente para tu día a día.',
      price: 299,
      originalPrice: 349,
      rating: 4.9,
      reviewCount: 2103
    },
    {
      id: '4',
      name: 'ChargeHub Wireless',
      category: 'CARGADORES',
      description: 'Carga rápida inalámbrica de última generación.',
      price: 89,
      rating: 4.6,
      reviewCount: 654,
      badge: 'Nuevo'
    },
    {
      id: '5',
      name: 'SoundWave Elite',
      category: 'AURICULARES',
      description: 'Diseño premium con audio de alta fidelidad.',
      price: 279,
      rating: 4.8,
      reviewCount: 1876,
      badge: 'Nuevo'
    },
    {
      id: '6',
      name: 'FlashDrive Pro',
      category: 'ALMACENAMIENTO',
      description: 'Velocidad y capacidad en un diseño elegante.',
      price: 129,
      originalPrice: 159,
      rating: 4.7,
      reviewCount: 743
    }
  ];

  // Todos los productos
  allProducts: Product[] = [
    ...this.carouselProducts,
    {
      id: '7',
      name: 'BassBoost Speaker',
      category: 'BOCINAS',
      description: 'Graves profundos y sonido envolvente.',
      price: 189,
      rating: 4.6,
      reviewCount: 432
    },
    {
      id: '8',
      name: 'TechPod Case',
      category: 'ACCESORIOS',
      description: 'Protección elegante para tus dispositivos.',
      price: 49,
      originalPrice: 69,
      rating: 4.5,
      reviewCount: 876,
      badge: 'Exclusivo'
    }
  ];
  
  // Navegación del carrusel
  get visibleProducts() {
    const start = this.currentSlide();
    return this.carouselProducts.slice(start, start + 3);
  }
  
  get canGoPrev() {
    return this.currentSlide() > 0;
  }
  
  get canGoNext() {
    return this.currentSlide() < this.carouselProducts.length - 3;
  }
  
  nextSlide() {
    if (this.canGoNext) {
      this.currentSlide.update(val => val + 1);
    }
  }
  
  prevSlide() {
    if (this.canGoPrev) {
      this.currentSlide.update(val => val - 1);
    }
  }
  
  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
