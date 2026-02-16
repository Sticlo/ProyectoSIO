import { Injectable, signal, inject } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly PRODUCTS_KEY = 'products';
  
  private storageService = inject(StorageService);
  
  private products = signal<Product[]>(this.loadProducts());
  
  readonly allProducts = this.products.asReadonly();
  
  constructor() {
    // Inicializar con productos de ejemplo si está vacío
    if (this.products().length === 0) {
      this.initializeDefaultProducts();
    }
  }
  
  /**
   * Cargar productos desde localStorage
   */
  private loadProducts(): Product[] {
    const stored = this.storageService.getLocal(this.PRODUCTS_KEY);
    return stored || [];
  }
  
  /**
   * Guardar productos en localStorage
   */
  private saveProducts(): void {
    this.storageService.setLocal(this.PRODUCTS_KEY, this.products());
  }
  
  /**
   * Inicializar productos por defecto
   */
  private initializeDefaultProducts(): void {
    const defaultProducts: Product[] = [
      {
        id: '1',
        name: 'AirBuds Pro Max',
        category: 'AURICULARES',
        description: 'Sonido premium con cancelación de ruido activa y 40 horas de batería.',
        price: 199,
        originalPrice: 249,
        rating: 4.8,
        reviewCount: 1542,
        badge: 'Oferta'
      },
      {
        id: '2',
        name: 'SoundPulse Speaker',
        category: 'BOCINAS',
        description: 'Potencia y claridad en un diseño compacto resistente al agua.',
        price: 149,
        rating: 4.7,
        reviewCount: 892
      },
      {
        id: '3',
        name: 'ChronoWave Watch',
        category: 'SMARTWATCH',
        description: 'Elegancia inteligente con monitoreo de salud 24/7.',
        price: 299,
        originalPrice: 349,
        rating: 4.9,
        reviewCount: 2103,
        badge: 'Popular'
      },
      {
        id: '4',
        name: 'ChargeHub Wireless',
        category: 'CARGADORES',
        description: 'Carga rápida inalámbrica de última generación para 3 dispositivos.',
        price: 89,
        rating: 4.6,
        reviewCount: 654,
        badge: 'Nuevo'
      }
    ];
    
    this.products.set(defaultProducts);
    this.saveProducts();
  }
  
  /**
   * Obtener todos los productos
   */
  getAll(): Product[] {
    return this.products();
  }
  
  /**
   * Obtener producto por ID
   */
  getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }
  
  /**
   * Crear nuevo producto
   */
  create(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    
    this.products.update(products => [...products, newProduct]);
    this.saveProducts();
    
    return newProduct;
  }
  
  /**
   * Actualizar producto existente
   */
  update(id: string, updates: Partial<Product>): boolean {
    const index = this.products().findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    this.products.update(products => {
      const updated = [...products];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    
    this.saveProducts();
    return true;
  }
  
  /**
   * Eliminar producto
   */
  delete(id: string): boolean {
    const initialLength = this.products().length;
    
    this.products.update(products => products.filter(p => p.id !== id));
    
    if (this.products().length < initialLength) {
      this.saveProducts();
      return true;
    }
    
    return false;
  }
  
  /**
   * Buscar productos
   */
  search(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.category?.toLowerCase().includes(lowerQuery) || false)
    );
  }
  
  /**
   * Filtrar por categoría
   */
  filterByCategory(category: string): Product[] {
    return this.products().filter(p => 
      p.category?.toLowerCase() === category.toLowerCase()
    );
  }
  
  /**
   * Actualizar stock de un producto
   */
  updateProductStock(productId: string, updatedProduct: Product): void {
    this.products.update(products =>
      products.map(p => p.id === productId ? updatedProduct : p)
    );
    this.saveProducts();
  }
  
  /**
   * Obtener productos con stock bajo
   */
  getLowStockProducts(): Product[] {
    return this.products().filter(p => {
      const stock = p.stockCount || 0;
      const minStock = p.minStock || 5;
      return stock > 0 && stock <= minStock;
    });
  }
  
  /**
   * Obtener productos agotados
   */
  getOutOfStockProducts(): Product[] {
    return this.products().filter(p => 
      (p.stockCount || 0) === 0 || p.inStock === false
    );
  }
}
