import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

export interface Product {
  id: string;
  name: string;
  category?: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  image?: string;
  badge?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card">
      <div class="product-image">
        @if (product.badge) {
          <span class="product-badge">{{ product.badge }}</span>
        }
        <button class="favorite-btn" aria-label="Agregar a favoritos">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        @if (product.image) {
          <img [src]="product.image" [alt]="product.name">
        } @else {
          <div class="image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        }
      </div>
      <div class="product-content">
        @if (product.category) {
          <span class="product-category">{{ product.category }}</span>
        }
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-price">
          <span class="price-current">\${{ product.price }}</span>
          @if (product.originalPrice) {
            <span class="price-original">\${{ product.originalPrice }}</span>
          }
        </div>
        <button 
          class="add-to-cart-btn"
          [class.added]="addedToCart()"
          (click)="addToCart($event)"
          [disabled]="addedToCart()">
          @if (addedToCart()) {
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Agregado
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Agregar al carrito
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 1px solid rgba(0, 0, 0, 0.06);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.1);
        
        .product-image img,
        .image-placeholder {
          transform: scale(1.05);
        }
        
        .add-to-cart-btn:not(.added) {
          background: #000;
        }
      }
    }
    
    .product-image {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      background: linear-gradient(135deg, #e8dfd0 0%, #d4cfc5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .image-placeholder {
        color: rgba(0, 0, 0, 0.15);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
    
    .product-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%);
      color: white;
      padding: 0.5rem 0.875rem;
      border-radius: 20px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
    }
    
    .favorite-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      svg {
        color: #86868b;
        transition: all 0.2s ease;
      }
      
      &:hover {
        transform: scale(1.1);
        background: white;
        
        svg {
          color: #ff3b30;
          fill: #ff3b30;
        }
      }
    }
    
    .product-content {
      padding: 1.25rem;
    }
    
    .product-category {
      display: block;
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #86868b;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    .product-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 0.75rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      letter-spacing: -0.01em;
    }
    
    .product-price {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 1rem;
      
      .price-current {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1d1d1f;
        letter-spacing: -0.02em;
      }
      
      .price-original {
        font-size: 1rem;
        color: #86868b;
        text-decoration: line-through;
      }
    }
    
    .add-to-cart-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #1d1d1f;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      letter-spacing: -0.01em;
      
      &:hover:not(:disabled) {
        background: #000;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      &.added {
        background: #34c759;
        cursor: default;
        
        &:hover {
          background: #34c759;
          transform: none;
          box-shadow: none;
        }
      }
      
      &:disabled {
        cursor: not-allowed;
      }
    }

    :host-context([data-theme="dark"]) {
      .product-card {
        background: #1e293b;
        border-color: rgba(51, 65, 85, 0.4);

        &:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
          border-color: rgba(14, 116, 144, 0.3);
        }
      }

      .product-image {
        background: linear-gradient(135deg, #263048 0%, #1e293b 100%);
      }

      .favorite-btn {
        background: rgba(30, 41, 59, 0.9);
        border-color: rgba(51, 65, 85, 0.4);
        svg { color: #64748b; }
        &:hover { background: #1e293b; }
      }

      .product-category { color: #64748b; }
      .product-name { color: #f1f5f9; }

      .product-price {
        .price-current { color: #f1f5f9; }
        .price-original { color: #64748b; }
      }

      .add-to-cart-btn {
        background: linear-gradient(135deg, #0E7490, #14B8A6);

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #14B8A6, #0E7490);
          box-shadow: 0 4px 12px rgba(14, 116, 144, 0.3);
        }
      }
    }
  `]
})
export class ProductCardComponent {
  private cartService = inject(CartService);
  
  @Input() product!: Product;
  
  addedToCart = signal(false);
  
  addToCart(event: Event): void {
    event.stopPropagation();
    
    this.cartService.addToCart({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.image,
      category: this.product.category
    }, 1);
    
    this.addedToCart.set(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      this.addedToCart.set(false);
    }, 2000);
  }
}
