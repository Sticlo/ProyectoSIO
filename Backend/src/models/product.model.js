// Almacenamiento en memoria para productos
let products = [
  {
    id: '1',
    name: 'AirBuds Pro Max',
    category: 'Auriculares',
    description: 'Sonido premium con cancelación de ruido activa y 40 horas de batería.',
    price: 199,
    originalPrice: 249,
    rating: 4.8,
    reviewCount: 1542,
    badge: 'Oferta',
    image: '/assets/placeholder-product.png',
    inStock: true,
    stockCount: 25,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'SoundPulse Speaker',
    category: 'Bocinas',
    description: 'Potencia y claridad en un diseño compacto resistente al agua.',
    price: 149,
    rating: 4.7,
    reviewCount: 892,
    image: '/assets/placeholder-product.png',
    inStock: true,
    stockCount: 18,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'ChronoWave Watch',
    category: 'Smartwatch',
    description: 'Elegancia inteligente con monitoreo de salud 24/7.',
    price: 299,
    originalPrice: 349,
    rating: 4.9,
    reviewCount: 2103,
    badge: 'Popular',
    image: '/assets/placeholder-product.png',
    inStock: true,
    stockCount: 32,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

class ProductModel {
  /**
   * Obtener todos los productos
   */
  static getAll() {
    return products;
  }

  /**
   * Buscar producto por ID
   */
  static findById(id) {
    return products.find(p => p.id === id);
  }

  /**
   * Buscar productos por categoría
   */
  static findByCategory(category) {
    return products.filter(p => p.category === category);
  }

  /**
   * Buscar productos (por nombre o descripción)
   */
  static search(query) {
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Crear nuevo producto
   */
  static create(productData) {
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    products.push(newProduct);
    return newProduct;
  }

  /**
   * Actualizar producto
   */
  static update(id, productData) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date()
    };
    
    return products[index];
  }

  /**
   * Actualizar stock del producto
   */
  static updateStock(id, quantity) {
    const product = this.findById(id);
    if (!product) return null;
    
    const newStock = product.stockCount + quantity;
    return this.update(id, { 
      stockCount: newStock,
      inStock: newStock > 0 
    });
  }

  /**
   * Eliminar producto
   */
  static delete(id) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  }
}

module.exports = ProductModel;
