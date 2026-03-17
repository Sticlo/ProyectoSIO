import { Component, signal, OnInit, AfterViewInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, AfterViewInit {
  protected readonly title = signal('SIO - Sistema Interno Operativo');

  // Splash screen state
  showSplash = signal(true);
  isFadingOut = signal(false);

  constructor(private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    // Elegant splash screen removal sequence
    // 1. Wait a bit for the user to see the logo (1.5 seconds)
    setTimeout(() => {
      // 2. Start fade out animation
      this.isFadingOut.set(true);

      // 3. Completely remove from DOM after the CSS fade-out transition finishes (0.8s)
      setTimeout(() => {
        this.showSplash.set(false);
      }, 800);

    }, 1500);
  }

  ngAfterViewInit() {
    // if (isPlatformBrowser(this.platformId)) {
    //   this.initCustomCursor();
    // }
  }

  // private initCustomCursor() {
  //   this.ngZone.runOutsideAngular(() => {
  //     const cursorDot = document.querySelector('.cursor-dot') as HTMLElement;
  //     const cursorOutline = document.querySelector('.cursor-outline') as HTMLElement;

  //     if (!cursorDot || !cursorOutline) return;

  //     // Make sure cursor stays hidden on native body inside app
  //     document.body.style.cursor = 'none';

  //     let currentMagneticEl: HTMLElement | null = null;

  //     window.addEventListener('mousemove', (e) => {
  //       const posX = e.clientX;
  //       const posY = e.clientY;

  //       cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

  //       cursorOutline.animate({
  //         transform: `translate3d(${posX}px, ${posY}px, 0)`
  //       }, { duration: 500, easing: 'ease-out', fill: 'forwards' });

  //       // Magnetic element logic
  //       const target = e.target as HTMLElement;
  //       const magneticEl = target.closest('.btn-hero-primary, .btn-hero-secondary, .btn-cta-primary, .btn-view-all, .nav-link, .btn') as HTMLElement;

  //       if (magneticEl) {
  //         currentMagneticEl = magneticEl;
  //         const rect = magneticEl.getBoundingClientRect();
  //         const x = e.clientX - rect.left - rect.width / 2;
  //         const y = e.clientY - rect.top - rect.height / 2;
  //         magneticEl.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  //       } else if (currentMagneticEl) {
  //         currentMagneticEl.style.transform = '';
  //         currentMagneticEl = null;
  //       }
  //     });

  //     // Event delegation for hover states
  //     window.addEventListener('mouseover', (e) => {
  //       const target = e.target as HTMLElement;
  //       const isClickable = target.closest('a, button, input, textarea, select, .btn, .service-card, .product-showcase-card, .about-card, [role="button"], label, .stat-card');

  //       if (isClickable) {
  //         cursorDot.classList.add('cursor-hover');
  //         cursorOutline.classList.add('cursor-hover');
  //       } else {
  //         cursorDot.classList.remove('cursor-hover');
  //         cursorOutline.classList.remove('cursor-hover');
  //       }
  //     });

  //     // Clean up body cursor when mousing out of window just in case
  //     document.addEventListener('mouseleave', () => {
  //       cursorDot.style.opacity = '0';
  //       cursorOutline.style.opacity = '0';
  //     });
  //     document.addEventListener('mouseenter', () => {
  //       cursorDot.style.opacity = '1';
  //       cursorOutline.style.opacity = '1';
  //     });
  //   });
  // }
}
