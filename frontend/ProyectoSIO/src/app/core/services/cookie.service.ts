import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean;

  // Cookie store for SSR
  private cookieStore: Map<string, string> = new Map();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Obtener una cookie
   */
  get(name: string): string | null {
    if (this.isBrowser) {
      const matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
      ));
      return matches ? decodeURIComponent(matches[1]) : null;
    }

    // SSR: return from cookie store
    return this.cookieStore.get(name) || null;
  }

  /**
   * Verificar si existe una cookie
   */
  check(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Establecer una cookie
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    if (this.isBrowser) {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

      // Expires
      if (options.expires) {
        if (typeof options.expires === 'number') {
          const date = new Date();
          date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
          cookieString += `; expires=${date.toUTCString()}`;
        } else {
          cookieString += `; expires=${options.expires.toUTCString()}`;
        }
      }

      // Path
      cookieString += `; path=${options.path || '/'}`;

      // Domain
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      // Secure
      if (options.secure) {
        cookieString += '; secure';
      }

      // SameSite
      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }

      document.cookie = cookieString;
    } else {
      // SSR: store in memory
      this.cookieStore.set(name, value);
    }
  }

  /**
   * Eliminar una cookie
   */
  delete(name: string, path: string = '/'):void {
    if (this.isBrowser) {
      this.set(name, '', {
        expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
        path: path
      });
    } else {
      this.cookieStore.delete(name);
    }
  }

  /**
   * Eliminar todas las cookies
   */
  deleteAll(path: string = '/'): void {
    if (this.isBrowser) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const name = cookie.split('=')[0].trim();
        this.delete(name, path);
      }
    } else {
      this.cookieStore.clear();
    }
  }

  /**
   * Obtener todas las cookies como objeto
   */
  getAll(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};

    if (this.isBrowser) {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (name && value) {
          cookies[name.trim()] = decodeURIComponent(value);
        }
      });
    } else {
      this.cookieStore.forEach((value, key) => {
        cookies[key] = value;
      });
    }

    return cookies;
  }

  /**
   * Aceptar cookies de consentimiento
   */
  acceptCookieConsent(): void {
    this.set('cookie_consent', 'accepted', {
      expires: 365,
      path: '/',
      sameSite: 'Lax'
    });
  }

  /**
   * Verificar si se aceptaron las cookies
   */
  hasCookieConsent(): boolean {
    return this.get('cookie_consent') === 'accepted';
  }

  /**
   * Rechazar cookies de consentimiento
   */
  rejectCookieConsent(): void {
    this.set('cookie_consent', 'rejected', {
      expires: 365,
      path: '/',
      sameSite: 'Lax'
    });
  }
}
