import { Component, signal, effect, computed, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NavigationService } from '../../core/services/navigation.service';
import { CartSidebarComponent } from '../../shared/components/cart-sidebar/cart-sidebar.component';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, CartSidebarComponent, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  brandName = 'SIO';
  promoBanner = 'NUEVA COLECCIÓN 2026 — ENVÍO GRATIS EN TU PRIMERA COMPRA';
  mobileMenuOpen = signal(false);
  searchOpen = signal(false);
  
  // ViewChild for cart sidebar
  cartSidebar = viewChild<CartSidebarComponent>('cartSidebar');
  
  // Auth
  user = computed(() => this.authService.user());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => this.authService.isAdmin());
  
  // Cart
  cartItemCount = computed(() => this.cartService.itemCount());
  
  // Search
  searchResults = computed(() => this.navigationService.searchResults());
  
  menuItems: MenuItem[] = [
    { label: 'Inicio', route: '/' },
    { label: 'Productos', route: '/productos' }
  ];
  
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    public navigationService: NavigationService,
    private router: Router
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
  
  toggleSearch() {
    this.searchOpen.update(open => !open);
    if (!this.searchOpen()) {
      this.navigationService.searchQuery.set('');
    } else {
      // Focus en el input cuando se abre
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }
  
  closeSearch() {
    // Delay para permitir que los clicks en resultados se procesen primero
    setTimeout(() => {
      this.searchOpen.set(false);
      this.navigationService.searchQuery.set('');
    }, 150);
  }
  
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.navigationService.searchQuery.set(input.value);
  }
  
  navigateToResult(route: string) {
    // Caso especial: abrir carrito
    if (route === '#cart') {
      this.openCart();
      this.closeSearch();
      return;
    }
    
    this.router.navigateByUrl(route);
    this.closeSearch();
  }
  
  openCart() {
    this.cartSidebar()?.open();
  }
  
  logout() {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
