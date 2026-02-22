const ProductModel = require('../models/product.model');

class InventoryController {
  /**
   * Obtener resumen de inventario
   */
  static getSummary(req, res) {
    try {
      const products = ProductModel.getAll();
      
      const totalProducts = products.length;
      const inStockCount = products.filter(p => p.inStock).length;
      const outOfStockCount = products.filter(p => !p.inStock).length;
      const lowStockCount = products.filter(p => p.stockCount > 0 && p.stockCount < 10).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockCount), 0);

      res.json({
        summary: {
          totalProducts,
          inStockCount,
          outOfStockCount,
          lowStockCount,
          totalValue
        }
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({ error: 'Error al obtener resumen de inventario' });
    }
  }

  /**
   * Obtener productos con bajo stock
   */
  static getLowStock(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const products = ProductModel.getAll();
      const lowStockProducts = products.filter(
        p => p.stockCount > 0 && p.stockCount < threshold
      );

      res.json({ 
        count: lowStockProducts.length,
        products: lowStockProducts 
      });
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error);
      res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
    }
  }

  /**
   * Obtener productos sin stock
   */
  static getOutOfStock(req, res) {
    try {
      const products = ProductModel.getAll();
      const outOfStockProducts = products.filter(p => !p.inStock || p.stockCount === 0);

      res.json({ 
        count: outOfStockProducts.length,
        products: outOfStockProducts 
      });
    } catch (error) {
      console.error('Error al obtener productos sin stock:', error);
      res.status(500).json({ error: 'Error al obtener productos sin stock' });
    }
  }

  /**
   * Ajustar inventario (entrada/salida de stock)
   */
  static adjustStock(req, res) {
    try {
      const { productId, quantity, type, reason } = req.body;

      // Validar campos requeridos
      if (!productId || quantity === undefined || !type) {
        return res.status(400).json({ 
          error: 'ID de producto, cantidad y tipo son requeridos' 
        });
      }

      // Validar tipo
      if (!['in', 'out'].includes(type)) {
        return res.status(400).json({ 
          error: 'Tipo debe ser "in" o "out"' 
        });
      }

      const product = ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Calcular cantidad según el tipo
      const adjustment = type === 'in' ? quantity : -quantity;

      // Actualizar stock
      const updatedProduct = ProductModel.updateStock(productId, adjustment);

      res.json({
        message: `Stock ajustado exitosamente (${type === 'in' ? 'entrada' : 'salida'})`,
        product: updatedProduct,
        adjustment: {
          type,
          quantity,
          reason,
          date: new Date()
        }
      });
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      res.status(500).json({ error: 'Error al ajustar inventario' });
    }
  }
}

module.exports = InventoryController;
