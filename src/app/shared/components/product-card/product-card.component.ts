import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
        @if (product.image) {
          <img [src]="product.image" [alt]="product.name">
        } @else {
          <div class="image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        }
      </div>
      <div class="product-content">
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-description">{{ product.description }}</p>
        <div class="product-footer">
          <span class="product-price">\${{ product.price | number:'1.2-2' }}</span>
          <app-button variant="outline" size="small">Ver más</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }
    
    .product-image {
      position: relative;
      width: 100%;
      height: 280px;
      background: linear-gradient(135deg, #f5f1eb 0%, #e8dfd0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .image-placeholder {
        color: rgba(0, 0, 0, 0.2);
      }
    }
    
    .product-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background-color: #1a1a1a;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .product-content {
      padding: 1.5rem;
    }
    
    .product-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 0.75rem;
    }
    
    .product-description {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
}
