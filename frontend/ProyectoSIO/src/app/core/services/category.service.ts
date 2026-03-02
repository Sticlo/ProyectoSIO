import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Category {
  id: number;
  name: string;
  type: 'producto' | 'gasto';
  description?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private api = inject(ApiService);
  
  private _categories = signal<Category[]>([]);
  readonly allCategories = this._categories.asReadonly();
  
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  
  constructor() {
    this.loadCategories();
  }
  
  /**
   * Cargar categorías desde el backend
   */
  loadCategories(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.api.get<{ count: number; categories: Category[] }>('/categories').subscribe({
      next: (res) => {
        this._categories.set(res.categories);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.error.set('No se pudieron cargar las categorías');
        this.isLoading.set(false);
      }
    });
  }
  
  /**
   * Obtener categorías de productos
   */
  getProductCategories(): Category[] {
    return this._categories().filter(c => c.type === 'producto');
  }
  
  /**
   * Obtener categorías de gastos
   */
  getExpenseCategories(): Category[] {
    return this._categories().filter(c => c.type === 'gasto');
  }
  
  /**
   * Buscar categoría por nombre y tipo
   */
  findByNameAndType(name: string, type: 'producto' | 'gasto'): Category | undefined {
    return this._categories().find(
      c => c.name.toLowerCase() === name.toLowerCase() && c.type === type
    );
  }
  
  /**
   * Buscar categoría por ID
   */
  findById(id: number): Category | undefined {
    return this._categories().find(c => c.id === id);
  }
}
