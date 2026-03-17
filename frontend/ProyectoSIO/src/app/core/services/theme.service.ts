import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  
  isDarkMode = signal(this.loadTheme());

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }
    // Respetar preferencia del sistema
    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    this.applyTheme();
  }

  applyTheme(): void {
    const dark = this.isDarkMode();
    document.documentElement.dataset['theme'] = dark ? 'dark' : 'light';
    localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
  }

  /** Llamar al iniciar la app para aplicar el tema guardado */
  init(): void {
    this.applyTheme();
  }
}
