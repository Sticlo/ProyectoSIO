import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'auth_user';
  private readonly USERS_KEY = 'registered_users';
  
  private storageService = inject(StorageService);
  private router = inject(Router);
  
  private currentUser = signal<User | null>(this.loadUser());
  
  // Computed signals
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  readonly isUser = computed(() => this.currentUser()?.role === UserRole.USER);
  
  constructor() {
    // Crear usuario admin por defecto si no existe
    this.initializeDefaultAdmin();
  }
  
  /**
   * Inicializar usuario admin por defecto
   */
  private initializeDefaultAdmin(): void {
    const users = this.getRegisteredUsers();
    const adminExists = users.some(u => u.role === UserRole.ADMIN);
    
    if (!adminExists) {
      const admin: User = {
        id: '1',
        email: 'admin@tienda.com',
        name: 'Administrador',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Guardar admin con contraseña "admin123"
      const usersWithCredentials = [
        {
          user: admin,
          password: 'admin123'
        }
      ];
      
      this.storageService.setLocal(this.USERS_KEY, usersWithCredentials);
    }
  }
  
  /**
   * Cargar usuario desde localStorage
   */
  private loadUser(): User | null {
    const stored = this.storageService.getLocal(this.AUTH_KEY);
    return stored || null;
  }
  
  /**
   * Obtener usuarios registrados
   */
  private getRegisteredUsers(): User[] {
    const stored = this.storageService.getLocal(this.USERS_KEY);
    if (!stored) return [];
    return stored.map((item: any) => item.user);
  }
  
  /**
   * Login de usuario
   */
  login(credentials: LoginCredentials): { success: boolean; message: string } {
    const usersWithCredentials = this.storageService.getLocal(this.USERS_KEY) || [];
    
    // Buscar usuario
    const found = usersWithCredentials.find(
      (item: any) => 
        item.user.email === credentials.email && 
        item.password === credentials.password
    );
    
    if (found) {
      this.currentUser.set(found.user);
      this.storageService.setLocal(this.AUTH_KEY, found.user);
      
      // Redirigir según rol
      if (found.user.role === UserRole.ADMIN) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/productos']);
      }
      
      return {
        success: true,
        message: `Bienvenido ${found.user.name}!`
      };
    }
    
    return {
      success: false,
      message: 'Email o contraseña incorrectos'
    };
  }
  
  /**
   * Registro de nuevo usuario
   */
  register(data: RegisterData): { success: boolean; message: string } {
    const usersWithCredentials = this.storageService.getLocal(this.USERS_KEY) || [];
    
    // Verificar si el email ya existe
    const emailExists = usersWithCredentials.some(
      (item: any) => item.user.email === data.email
    );
    
    if (emailExists) {
      return {
        success: false,
        message: 'Este email ya está registrado'
      };
    }
    
    // Crear nuevo usuario
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Guardar usuario con contraseña
    usersWithCredentials.push({
      user: newUser,
      password: data.password
    });
    
    this.storageService.setLocal(this.USERS_KEY, usersWithCredentials);
    
    // Autologin
    this.currentUser.set(newUser);
    this.storageService.setLocal(this.AUTH_KEY, newUser);
    this.router.navigate(['/productos']);
    
    return {
      success: true,
      message: 'Registro exitoso! Bienvenido!'
    };
  }
  
  /**
   * Logout
   */
  logout(): void {
    this.currentUser.set(null);
    this.storageService.removeLocal(this.AUTH_KEY);
    this.router.navigate(['/home']);
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
