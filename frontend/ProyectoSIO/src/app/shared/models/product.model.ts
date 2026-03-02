export interface Product {
  id: string;
  name: string;
  category?: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  cost?: number; // Costo de compra/producción del producto
  image?: string;
  images?: string[]; // Multiple images for carousel
  badge?: string;
  features?: string[]; // Product features
  specifications?: { [key: string]: string }; // Technical specs
  inStock?: boolean;
  stockCount?: number;

  lastRestocked?: Date; // Última vez que se reabastació
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  helpful: number;
}
