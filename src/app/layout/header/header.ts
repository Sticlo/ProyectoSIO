import { Component, signal, effect, computed, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CartSidebarComponent } from '../../shared/components/cart-sidebar/cart-sidebar.component';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, CartSidebarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  brandName = 'SIO';
  promoBanner = 'NUEVA COLECCIÓN 2026 — ENVÍO GRATIS EN TU PRIMERA COMPRA';
  mobileMenuOpen = signal(false);
  
  // ViewChild for cart sidebar
  cartSidebar = viewChild<CartSidebarComponent>('cartSidebar');
  
  // Auth
  user = computed(() => this.authService.user());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => this.authService.isAdmin());
  
  // Cart
  cartItemCount = computed(() => this.cartService.itemCount());
  
  menuItems: MenuItem[] = [
    { label: 'Inicio', route: '/' },
    { label: 'Productos', route: '/productos' }
  ];
  
  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {
    // Prevenir scroll cuando el menú está abierto
    effect(() => {
      if (this.mobileMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }
  
  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
  
  openCart() {
    this.cartSidebar()?.open();
  }
  
  logout() {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
