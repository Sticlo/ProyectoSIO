import { Injectable, signal, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { ApiService } from './api.service';

// Forma del producto tal como llega desde la API (snake_case)
interface RawProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  original_price: string | null;
  cost: string | null;
  rating: string | null;
  review_count: number;
  badge: string | null;
  image: string | null;
  in_stock: number | boolean;
  stock_count: number;
  min_stock: number;
  max_stock: number;
  category_id: number | null;
  category_name: string | null;
}

/** Convierte respuesta de la API → interfaz Product del frontend */
function fromApi(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description || '',
    category: raw.category_name || undefined,
    price: Number(raw.price),
    originalPrice: raw.original_price ? Number(raw.original_price) : undefined,
    cost: raw.cost ? Number(raw.cost) : undefined,
    rating: raw.rating ? Number(raw.rating) : undefined,
    reviewCount: raw.review_count ?? 0,
    badge: raw.badge ?? undefined,
    image: raw.image ?? undefined,
    inStock: Boolean(raw.in_stock),
    stockCount: raw.stock_count ?? 0,
    minStock: raw.min_stock ?? 5,
    maxStock: raw.max_stock ?? 100,
  };
}

/** Convierte Product del frontend → payload para la API (snake_case) */
function toApi(p: Partial<Product> & { category_id?: number | null }): Record<string, unknown> {
  return {
    name: p.name,
    description: p.description,
    price: p.price,
    original_price: p.originalPrice ?? null,
    cost: p.cost ?? null,
    rating: p.rating ?? null,
    review_count: p.reviewCount ?? 0,
    badge: p.badge ?? null,
    image: p.image ?? null,
    in_stock: p.inStock ?? true,
    stock_count: p.stockCount ?? 0,
    min_stock: p.minStock ?? 5,
    max_stock: p.maxStock ?? 100,
    category_id: p.category_id ?? null,
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = inject(ApiService);

  private _products = signal<Product[]>([]);
  readonly allProducts = this._products.asReadonly();

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadProducts();
  }

  /**
   * Carga productos desde el backend y actualiza la señal
   */
  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.get<{ count: number; products: RawProduct[] }>('/products').subscribe({
      next: (res) => {
        this._products.set(res.products.map(fromApi));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error.set('No se pudieron cargar los productos');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Obtener todos los productos (señal)
   */
  getAll(): Product[] {
    return this._products();
  }

  /**
   * Obtener producto por ID
   */
  getById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  /**
   * Crear producto — POST /api/products
   */
  create(product: Partial<Product> & { category_id?: number | null }): Observable<Product> {
    return this.api.post<{ message: string; product: RawProduct }>('/products', toApi(product)).pipe(
      map(res => fromApi(res.product)),
      tap(newProduct => this._products.update(list => [...list, newProduct]))
    );
  }

  /**
   * Actualizar producto — PUT /api/products/:id
   */
  update(id: string, updates: Partial<Product> & { category_id?: number | null }): Observable<Product> {
    return this.api.put<{ message: string; product: RawProduct }>(`/products/${id}`, toApi(updates)).pipe(
      map(res => fromApi(res.product)),
      tap(updated => this._products.update(list => list.map(p => p.id === id ? updated : p)))
    );
  }

  /**
   * Eliminar producto — DELETE /api/products/:id
   */
  delete(id: string): Observable<void> {
    return this.api.delete<{ message: string }>(`/products/${id}`).pipe(
      tap(() => this._products.update(list => list.filter(p => p.id !== id))),
      map(() => void 0)
    );
  }

  /**
   * Buscar productos localmente (cliente)
   */
  search(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this._products().filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.category?.toLowerCase().includes(lowerQuery) || false)
    );
  }

  /**
   * Filtrar por categoría localmente
   */
  filterByCategory(category: string): Product[] {
    return this._products().filter(p =>
      p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Actualizar stock de un producto en la señal local
   */
  updateProductStock(productId: string, updatedProduct: Product): void {
    this._products.update(products =>
      products.map(p => p.id === productId ? updatedProduct : p)
    );
  }

  /**
   * Obtener productos con stock bajo
   */
  getLowStockProducts(): Product[] {
    return this._products().filter(p => {
      const stock = p.stockCount || 0;
      const minStock = p.minStock || 5;
      return stock > 0 && stock <= minStock;
    });
  }

  /**
   * Obtener productos agotados
   */
  getOutOfStockProducts(): Product[] {
    return this._products().filter(p =>
      (p.stockCount || 0) === 0 || p.inStock === false
    );
  }
}
