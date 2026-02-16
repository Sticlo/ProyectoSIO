import { Component, signal, inject, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { SiteConfig } from '../../../config/site.config';
import { CheckoutModalComponent } from '../checkout-modal/checkout-modal.component';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, CheckoutModalComponent],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent {
  private cartService = inject(CartService);
  private whatsappService = inject(WhatsAppService);
  
  // Configuración del sitio
  protected readonly siteConfig = SiteConfig;
  
  // Checkout modal reference
  checkoutModal = viewChild.required(CheckoutModalComponent);
  
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
    const items = this.cartItems();
    
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    // Abrir el modal de checkout que solicitará datos del cliente
    this.checkoutModal().open();
  }
  
  onCheckoutSuccess(): void {
    // Cerrar el sidebar cuando el checkout es exitoso
    if (SiteConfig.orders.clearCartAfterCheckout) {
      this.closeCart();
    }
  }
}
