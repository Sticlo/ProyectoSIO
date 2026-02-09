import { Component, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  brandName = 'SIO';
  promoBanner = 'NUEVA COLECCIÓN 2026 — ENVÍO GRATIS EN TU PRIMERA COMPRA';
  mobileMenuOpen = signal(false);
  
  menuItems: MenuItem[] = [
    { label: 'Inicio', route: '/' },
    { label: 'Productos', route: '/productos' },
    { label: 'Categorías', route: '/categorias' },
    { label: 'Testimonios', route: '/testimonios' }
  ];
  
  constructor() {
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
}
