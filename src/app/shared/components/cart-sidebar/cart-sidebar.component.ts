import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
  private cartService = inject(CartService);
  
  // Signals
  isOpen = signal(false);
  
  // Outputs
  close = output<void>();
  
  // Cart data from service
  cartItems = this.cartService.cartItems;
  itemCount = this.cartService.itemCount;
  totalPrice = this.cartService.totalPrice;
  
  open(): void {
    this.isOpen.set(true);
  }
  
  closeCart(): void {
    this.isOpen.set(false);
    this.close.emit();
  }
  
  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }
  
  increaseQuantity(productId: string, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }
  
  decreaseQuantity(productId: string, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    }
  }
  
  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }
  
  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }
  
  checkout(): void {
    alert('Funcionalidad de checkout próximamente');
  }
}
