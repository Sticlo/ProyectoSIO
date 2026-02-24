const InventoryModel = require('../models/inventory.model');
const ProductModel = require('../models/product.model');

class InventoryController {
  /**
   * Obtener resumen de inventario
   */
  static async getSummary(req, res) {
    try {
      const summary = await InventoryModel.getSummary();
      res.json({ summary });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({ error: 'Error al obtener resumen de inventario' });
    }
  }

  /**
   * Obtener productos con bajo stock
   */
  static async getLowStock(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const products = await InventoryModel.getLowStock(threshold);

      res.json({ 
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error);
      res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
    }
  }

  /**
   * Obtener productos sin stock
   */
  static async getOutOfStock(req, res) {
    try {
      const products = await InventoryModel.getOutOfStock();

      res.json({ 
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Error al obtener productos sin stock:', error);
      res.status(500).json({ error: 'Error al obtener productos sin stock' });
    }
  }

  /**
   * Ajustar inventario (entrada/salida de stock)
   * Registra en movimientos_inventario (FK → productos, FK → usuarios)
   * y actualiza stock del producto en la misma transacción
   */
  static async adjustStock(req, res) {
    try {
      const { productId, quantity, type, reason, notes } = req.body;

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

      // Verificar que el producto existe
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Verificar stock suficiente para salida
      if (type === 'out' && product.stock_count < quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente. Disponible: ${product.stock_count}` 
        });
      }

      // Crear movimiento + actualizar stock (transacción)
      const movement = await InventoryModel.createMovement({
        product_id: productId,
        type,
        quantity,
        reason,
        notes,
        created_by: req.user ? req.user.id : null
      });

      res.json({
        message: `Stock ajustado exitosamente (${type === 'in' ? 'entrada' : 'salida'})`,
        movement,
        newStock: movement.new_stock
      });
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      res.status(500).json({ error: 'Error al ajustar inventario' });
    }
  }

  /**
   * Obtener historial de movimientos
   */
  static async getMovements(req, res) {
    try {
      const { productId } = req.query;
      let movements;

      if (productId) {
        movements = await InventoryModel.getByProduct(productId);
      } else {
        movements = await InventoryModel.getAll();
      }

      res.json({
        count: movements.length,
        movements
      });
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      res.status(500).json({ error: 'Error al obtener movimientos' });
    }
  }
}

module.exports = InventoryController;
