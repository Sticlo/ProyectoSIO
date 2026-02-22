import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageService = inject(StorageService);
  private readonly CART_KEY = 'shopping_cart';
  
  private items = signal<CartItem[]>(this.loadCart());
  
  // Computed values
  readonly cartItems = this.items.asReadonly();
  readonly itemCount = computed(() => 
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );
  
  private loadCart(): CartItem[] {
    const stored = this.storageService.getItem(this.CART_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  private saveCart(): void {
    this.storageService.setItem(this.CART_KEY, JSON.stringify(this.items()));
  }
  
  addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    this.items.update(currentItems => {
      const existingItem = currentItems.find(i => i.productId === item.productId);
      
      if (existingItem) {
        return currentItems.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      
      return [...currentItems, { ...item, quantity }];
    });
    
    this.saveCart();
  }
  
  removeFromCart(productId: string): void {
    this.items.update(currentItems =>
      currentItems.filter(item => item.productId !== productId)
    );
    this.saveCart();
  }
  
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    this.items.update(currentItems =>
      currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
    this.saveCart();
  }
  
  clearCart(): void {
    this.items.set([]);
    this.storageService.removeItem(this.CART_KEY);
  }
  
  isInCart(productId: string): boolean {
    return this.items().some(item => item.productId === productId);
  }
  
  getItemQuantity(productId: string): number {
    return this.items().find(item => item.productId === productId)?.quantity ?? 0;
  }
}
