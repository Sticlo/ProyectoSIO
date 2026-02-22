const OrderModel = require('../models/order.model');
const ProductModel = require('../models/product.model');

class OrderController {
  /**
   * Obtener todas las órdenes
   */
  static getAll(req, res) {
    try {
      const { status, phoneNumber } = req.query;
      
      let orders;

      if (status) {
        orders = OrderModel.findByStatus(status);
      } else if (phoneNumber) {
        orders = OrderModel.findByPhone(phoneNumber);
      } else {
        orders = OrderModel.getAll();
      }

      res.json({ 
        count: orders.length,
        orders 
      });
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({ error: 'Error al obtener órdenes' });
    }
  }

  /**
   * Obtener orden por ID
   */
  static getById(req, res) {
    try {
      const { id } = req.params;
      const order = OrderModel.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      res.json({ order });
    } catch (error) {
      console.error('Error al obtener orden:', error);
      res.status(500).json({ error: 'Error al obtener orden' });
    }
  }

  /**
   * Crear nueva orden
   */
  static create(req, res) {
    try {
      const { phoneNumber, items, total, shippingCost, customerName, customerAddress, notes } = req.body;

      // Validar campos requeridos
      if (!phoneNumber || !items || !items.length || !total) {
        return res.status(400).json({ 
          error: 'Teléfono, items y total son requeridos' 
        });
      }

      // Verificar stock de productos
      for (const item of items) {
        const product = ProductModel.findById(item.productId || item.id);
        if (!product) {
          return res.status(404).json({ 
            error: `Producto ${item.name} no encontrado` 
          });
        }
        if (product.stockCount < item.quantity) {
          return res.status(400).json({ 
            error: `Stock insuficiente para ${item.name}` 
          });
        }
      }

      // Crear orden
      const newOrder = OrderModel.create({
        phoneNumber,
        customerName,
        customerAddress,
        items,
        total,
        shippingCost: shippingCost || 0,
        notes
      });

      // Actualizar stock de productos
      for (const item of items) {
        ProductModel.updateStock(item.productId || item.id, -item.quantity);
      }

      res.status(201).json({
        message: 'Orden creada exitosamente',
        order: newOrder
      });
    } catch (error) {
      console.error('Error al crear orden:', error);
      res.status(500).json({ error: 'Error al crear orden' });
    }
  }

  /**
   * Actualizar orden
   */
  static update(req, res) {
    try {
      const { id } = req.params;
      const orderData = req.body;

      const updatedOrder = OrderModel.update(id, orderData);

      if (!updatedOrder) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      res.json({
        message: 'Orden actualizada exitosamente',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      res.status(500).json({ error: 'Error al actualizar orden' });
    }
  }

  /**
   * Actualizar estado de la orden
   */
  static updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-response'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Estado inválido' 
        });
      }

      const updatedOrder = OrderModel.updateStatus(id, status);

      if (!updatedOrder) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      res.json({
        message: 'Estado actualizado exitosamente',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }

  /**
   * Marcar orden como vista
   */
  static markAsViewed(req, res) {
    try {
      const { id } = req.params;
      const updatedOrder = OrderModel.markAsViewed(id);

      if (!updatedOrder) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      res.json({
        message: 'Orden marcada como vista',
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error al marcar orden:', error);
      res.status(500).json({ error: 'Error al marcar orden' });
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static getStats(req, res) {
    try {
      const stats = OrderModel.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  /**
   * Eliminar orden
   */
  static delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = OrderModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      res.json({ message: 'Orden eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar orden:', error);
      res.status(500).json({ error: 'Error al eliminar orden' });
    }
  }
}

module.exports = OrderController;
