import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';

export interface MetaTagsConfig {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly defaultConfig: MetaTagsConfig = {
    title: 'Sistema de Gestión - Tu Tienda de Tecnología',
    description: 'Sistema integral de gestión para tiendas de tecnología. Gestiona inventario, pedidos, gastos y más.',
    keywords: 'tecnología, tienda, inventario, gestión, pedidos, auriculares, bocinas, smartwatch',
    author: 'Sistema de Gestión',
    robots: 'index, follow',
    ogType: 'website'
  };

  constructor() {
    // Auto-update canonical URL on route changes
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateCanonicalUrl();
      });
    }
  }

  /**
   * Configurar meta tags para SEO
   */
  setMetaTags(config: MetaTagsConfig): void {
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Title
    if (mergedConfig.title) {
      this.titleService.setTitle(mergedConfig.title);
    }

    // Standard meta tags
    this.updateOrCreateTag('name', 'description', mergedConfig.description);
    this.updateOrCreateTag('name', 'keywords', mergedConfig.keywords);
    this.updateOrCreateTag('name', 'author', mergedConfig.author);
    this.updateOrCreateTag('name', 'robots', mergedConfig.robots);

    // Open Graph tags
    this.updateOrCreateTag('property', 'og:title', mergedConfig.ogTitle || mergedConfig.title);
    this.updateOrCreateTag('property', 'og:description', mergedConfig.ogDescription || mergedConfig.description);
    this.updateOrCreateTag('property', 'og:image', mergedConfig.ogImage);
    this.updateOrCreateTag('property', 'og:url', mergedConfig.ogUrl || this.getCurrentUrl());
    this.updateOrCreateTag('property', 'og:type', mergedConfig.ogType);

    // Twitter Card tags
    this.updateOrCreateTag('name', 'twitter:card', mergedConfig.twitterCard || 'summary_large_image');
    this.updateOrCreateTag('name', 'twitter:title', mergedConfig.twitterTitle || mergedConfig.title);
    this.updateOrCreateTag('name', 'twitter:description', mergedConfig.twitterDescription || mergedConfig.description);
    this.updateOrCreateTag('name', 'twitter:image', mergedConfig.twitterImage || mergedConfig.ogImage);

    // Update canonical
    this.updateCanonicalUrl(mergedConfig.ogUrl);
  }

  /**
   * Actualizar o crear un meta tag
   */
  private updateOrCreateTag(attrSelector: string, attrValue: string, content: string | undefined): void {
    if (!content) return;

    const selector = `${attrSelector}="${attrValue}"`;
    const existing = this.meta.getTag(selector);

    if (existing) {
      this.meta.updateTag({ [attrSelector]: attrValue, content }, selector);
    } else {
      this.meta.addTag({ [attrSelector]: attrValue, content });
    }
  }

  /**
   * Actualizar URL canónica
   */
  private updateCanonicalUrl(url?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canonicalUrl = url || this.getCurrentUrl();
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', canonicalUrl);
  }

  /**
   * Obtener URL actual
   */
  private getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return globalThis.window.location.href;
    }
    return '';
  }

  /**
   * Configuración para página de inicio
   */
  setHomePageMeta(): void {
    this.setMetaTags({
      title: 'Inicio - Sistema de Gestión',
      description: 'Bienvenido a nuestro sistema de gestión para tiendas de tecnología. Productos de alta calidad.',
      ogImage: '/assets/images/og-home.jpg'
    });
  }

  /**
   * Configuración para página de productos
   */
  setProductsPageMeta(): void {
    this.setMetaTags({
      title: 'Productos - Sistema de Gestión',
      description: 'Explora nuestro catálogo completo de productos tecnológicos.',
      ogImage: '/assets/images/og-products.jpg'
    });
  }

  /**
   * Configuración para página de producto individual
   */
  setProductDetailMeta(productName: string, description: string, price: number, imageUrl?: string): void {
    this.setMetaTags({
      title: `${productName} - Sistema de Gestión`,
      description: description,
      ogTitle: productName,
      ogDescription: `${description} - Precio: $${price.toLocaleString('es-CO')}`,
      ogImage: imageUrl,
      ogType: 'product'
    });
  }

  /**
   * Agregar structured data (JSON-LD)
   */
  addStructuredData(data: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let script: HTMLScriptElement | null = document.querySelector('script[type="application/ld+json"]');

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }
}
