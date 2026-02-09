import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

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
  imports: [CommonModule, ButtonComponent],
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
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        
        .product-image img,
        .image-placeholder {
          transform: scale(1.05);
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
      background-color: #e63946;
      color: white;
      padding: 0.5rem 0.875rem;
      border-radius: 20px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      z-index: 2;
    }
    
    .favorite-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      background: white;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      svg {
        color: #666;
        transition: all 0.3s ease;
      }
      
      &:hover {
        transform: scale(1.1);
        
        svg {
          color: #e63946;
          fill: #e63946;
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
      color: #999;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    .product-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 0.75rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-price {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      
      .price-current {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
      }
      
      .price-original {
        font-size: 1rem;
        color: #999;
        text-decoration: line-through;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
}
