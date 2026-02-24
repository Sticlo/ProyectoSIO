const OrderModel = require('../models/order.model');
const ProductModel = require('../models/product.model');

class OrderController {
  /**
   * Obtener todas las órdenes
   */
  static async getAll(req, res) {
    try {
      const { status, phoneNumber } = req.query;
      
      let orders;

      if (status) {
        orders = await OrderModel.findByStatus(status);
      } else if (phoneNumber) {
        orders = await OrderModel.findByPhone(phoneNumber);
      } else {
        orders = await OrderModel.getAll();
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
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);

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
   * La transacción en OrderModel.create() se encarga de:
   *   1. Insertar en ordenes
   *   2. Insertar cada item en orden_items (FK → ordenes, FK → productos)
   *   3. Descontar stock en productos
   */
  static async create(req, res) {
    try {
      const { phoneNumber, items, total, shippingCost, customerName, customerAddress, notes } = req.body;

      // Validar campos requeridos
      if (!phoneNumber || !items || !items.length || !total) {
        return res.status(400).json({ 
          error: 'Teléfono, items y total son requeridos' 
        });
      }

      // Verificar stock de productos antes de crear
      for (const item of items) {
        const productId = item.productId || item.product_id || item.id;
        if (productId) {
          const product = await ProductModel.findById(productId);
          if (!product) {
            return res.status(404).json({ 
              error: `Producto ${item.name || item.product_name} no encontrado` 
            });
          }
          if (product.stock_count < item.quantity) {
            return res.status(400).json({ 
              error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock_count}` 
            });
          }
        }
      }

      // Crear orden (transacción: inserta orden + items + descuenta stock)
      const newOrder = await OrderModel.create({
        phoneNumber,
        customerName,
        customerAddress,
        items,
        total,
        shippingCost: shippingCost || 0,
        notes
      });

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
  static async update(req, res) {
    try {
      const { id } = req.params;
      const orderData = req.body;

      const updatedOrder = await OrderModel.update(id, orderData);

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
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-response'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Estado inválido' 
        });
      }

      const updatedOrder = await OrderModel.updateStatus(id, status);

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
  static async markAsViewed(req, res) {
    try {
      const { id } = req.params;
      const updatedOrder = await OrderModel.markAsViewed(id);

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
  static async getStats(req, res) {
    try {
      const stats = await OrderModel.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  /**
   * Eliminar orden (CASCADE borra orden_items automáticamente)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await OrderModel.delete(id);

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
