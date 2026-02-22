import { Component, signal, effect, computed, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NavigationService } from '../../core/services/navigation.service';
import { CartSidebarComponent } from '../../shared/components/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, CartSidebarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {
  // ViewChild for cart sidebar
  cartSidebar = viewChild<CartSidebarComponent>('cartSidebar');
  // UI State
  searchVisible = signal(false);
  searchFocused = signal(false);
  mobileMenuVisible = signal(false);
  userMenuVisible = signal(false);
  searchQuery = signal('');
  
  // Computed properties
  currentUser = computed(() => this.authService.user());
  isLoggedIn = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => this.authService.isAdmin());
  cartCount = computed(() => this.cartService.itemCount());
  
  // Navigation items
  navigationItems = computed(() => this.navigationService.getAllItems().filter(item => 
    item.section === 'Navegación'
  ));
  
  // Search results (filtered by search query)
  searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    return this.navigationService.getAllItems().filter((item: any) => 
      item.title.toLowerCase().includes(query)
    );
  });
  
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private navigationService: NavigationService,
    private router: Router
  ) {
    // Prevent scroll when mobile menu is open
    effect(() => {
      if (this.mobileMenuVisible()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close search when navigating
    effect(() => {
      if (this.searchVisible()) {
        setTimeout(() => {
          const input = document.querySelector('.search-input') as HTMLInputElement;
          if (input) input.focus();
        }, 100);
      }
    });
  }
  
  closeSearch() {
    this.searchVisible.set(false);
    this.searchQuery.set('');
  }
  
  clearSearch() {
    this.searchQuery.set('');
  }
  
  onSearchBlur() {
    // Delay to allow click on result
    setTimeout(() => {
      this.searchFocused.set(false);
    }, 200);
  }
  
  onResultClick() {
    this.searchQuery.set('');
    this.searchFocused.set(false);
  }
  
  toggleCart() {
    const cart = this.cartSidebar();
    if (cart) {
      if (cart.isOpen()) {
        cart.closeCart();
      } else {
        cart.open();
      }
    }
  }
  
  logout() {
    this.authService.logout();
    this.mobileMenuVisible.set(false);
    this.userMenuVisible.set(false);
  }
}
