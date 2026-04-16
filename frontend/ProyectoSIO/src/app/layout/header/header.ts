import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {
  mobileMenuVisible = signal(false);
  isScrolled = signal(false);

  navItems = [
    { label: 'Resources', route: '/faq', dot: true },
    { label: 'Pricing', route: '/pricing', dot: false },
    { label: 'Customers', route: '/portfolio', dot: false },
    { label: 'About', route: '/about', dot: false },
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition > 50) {
      this.isScrolled.set(true);
    } else {
      this.isScrolled.set(false);
    }
  }
}
