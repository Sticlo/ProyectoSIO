import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';
import { environment } from '@environments/environment';
import { Observable, tap, catchError, of, map } from 'rxjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;
  
  private readonly currentUser = signal<User | null>(this.loadUser());
  
  // Computed signals
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  readonly isUser = computed(() => this.currentUser()?.role === UserRole.USER);
  
  /**
   * Cargar usuario desde localStorage
   */
  private loadUser(): User | null {
    const token = this.storageService.getItem(this.TOKEN_KEY);
    const stored = this.storageService.getLocal(this.USER_KEY);
    if (token && stored) {
      // Verificar si el token está expirado
      if (this.isTokenExpired(token)) {
        this.storageService.removeItem(this.TOKEN_KEY);
        this.storageService.removeLocal(this.USER_KEY);
        return null;
      }
      return stored;
    }
    // Si no hay token, limpiar datos inconsistentes
    this.storageService.removeLocal(this.USER_KEY);
    return null;
  }
  
  /**
   * Verificar si un token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Verificar si el token expira pronto (dentro de 1 hora)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const oneHourMs = 60 * 60 * 1000;
      return (payload.exp * 1000) - Date.now() < oneHourMs;
    } catch {
      return true;
    }
  }

  /**
   * Renovar el token JWT con el backend
   * Guarda el nuevo token y retorna true si fue exitoso
   */
  refreshToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);

    return this.http.post<{ token: string }>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      tap((response) => {
        this.storageService.setItem(this.TOKEN_KEY, response.token);
        console.log('🔄 Token renovado automáticamente');
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }
  
  /**
   * Obtener token JWT almacenado
   */
  getToken(): string | null {
    return this.storageService.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Login de usuario - llama al backend API
   */
  login(credentials: LoginCredentials): Observable<{ success: boolean; message: string }> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        // Guardar token JWT
        this.storageService.setItem(this.TOKEN_KEY, response.token);
        
        // Mapear usuario del backend al modelo del frontend
        const user: User = {
          id: response.user.id.toString(),
          email: response.user.email,
          name: response.user.name,
          role: response.user.role as UserRole,
          createdAt: new Date(response.user.created_at),
          updatedAt: new Date(response.user.updated_at)
        };
        
        // Guardar usuario
        this.currentUser.set(user);
        this.storageService.setLocal(this.USER_KEY, user);
        
        // Redirigir según rol
        if (user.role === UserRole.ADMIN) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/productos']);
        }
      }),
      map((response) => ({
        success: true,
        message: response.message || `Bienvenido ${response.user.name}!`
      })),
      catchError((error) => {
        const message = error.error?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
        return of({ success: false, message });
      })
    );
  }
  
  /**
   * Logout
   */
  logout(): void {
    this.currentUser.set(null);
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeLocal(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Guardar token directamente (usado por el interceptor al renovar)
   */
  saveToken(token: string): void {
    this.storageService.setItem(this.TOKEN_KEY, token);
  }
  
  /**
   * Verificar si tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }
  
  /**
   * Obtener información del usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }
}
