import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from '../../../core/services/cookie.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showBanner()) {
      <div class="cookie-consent-banner">
        <div class="cookie-content">
          <div class="cookie-icon">🍪</div>
          <div class="cookie-text">
            <h3>Uso de Cookies</h3>
            <p>
              Utilizamos cookies para mejorar tu experiencia de navegación, analizar el tráfico del sitio
              y personalizar el contenido. Al hacer clic en "Aceptar", aceptas el uso de cookies.
            </p>
          </div>
          <div class="cookie-actions">
            <button class="btn-accept" (click)="accept()">Aceptar</button>
            <button class="btn-reject" (click)="reject()">Rechazar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cookie-consent-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .cookie-icon {
      font-size: 3rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .cookie-text {
      flex: 1;
      min-width: 300px;
    }

    .cookie-text h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .cookie-text p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.95;
      line-height: 1.5;
    }

    .cookie-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-accept,
    .btn-reject {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-accept {
      background: white;
      color: #667eea;
    }

    .btn-accept:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
    }

    .btn-reject {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-reject:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .cookie-content {
        flex-direction: column;
        text-align: center;
      }

      .cookie-actions {
        width: 100%;
        flex-direction: column;
      }

      .btn-accept,
      .btn-reject {
        width: 100%;
      }
    }
  `]
})
export class CookieConsentComponent {
  private readonly cookieService = inject(CookieService);
  showBanner = signal(false);

  constructor() {
    effect(() => {
      // Check if user has already responded to cookie consent
      const hasConsent = this.cookieService.check('cookie_consent');
      this.showBanner.set(!hasConsent);
    });
  }

  accept(): void {
    this.cookieService.acceptCookieConsent();
    this.showBanner.set(false);
  }

  reject(): void {
    this.cookieService.rejectCookieConsent();
    this.showBanner.set(false);
  }
}
