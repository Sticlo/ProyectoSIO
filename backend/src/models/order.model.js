const { pool } = require('../config/database');

class OrderModel {
  /**
   * Obtener todas las órdenes (con sus items)
   */
  static async getAll() {
    const [orders] = await pool.query(
      'SELECT * FROM ordenes ORDER BY date DESC'
    );

    // Cargar items de cada orden
    for (const order of orders) {
      order.items = await OrderModel.getOrderItems(order.id);
    }
    return orders;
  }

  /**
   * Buscar orden por ID (con items)
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM ordenes WHERE id = ?',
      [id]
    );
    if (!rows[0]) return null;

    rows[0].items = await OrderModel.getOrderItems(id);
    return rows[0];
  }

  /**
   * Buscar órdenes por estado
   */
  static async findByStatus(status) {
    const [orders] = await pool.query(
      'SELECT * FROM ordenes WHERE status = ? ORDER BY date DESC',
      [status]
    );
    for (const order of orders) {
      order.items = await OrderModel.getOrderItems(order.id);
    }
    return orders;
  }

  /**
   * Buscar órdenes por número de teléfono
   */
  static async findByPhone(phoneNumber) {
    const [orders] = await pool.query(
      'SELECT * FROM ordenes WHERE phone_number = ? ORDER BY date DESC',
      [phoneNumber]
    );
    for (const order of orders) {
      order.items = await OrderModel.getOrderItems(order.id);
    }
    return orders;
  }

  /**
   * Obtener items de una orden (JOIN con productos)
   */
  static async getOrderItems(ordenId) {
    const [items] = await pool.query(`
      SELECT oi.*, p.image, p.category_id
      FROM orden_items oi
      LEFT JOIN productos p ON oi.product_id = p.id
      WHERE oi.orden_id = ?
    `, [ordenId]);
    return items;
  }

  /**
   * Crear nueva orden con sus items
   * Usa transacción para asegurar consistencia
   */
  static async create(orderData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insertar la orden
      const [orderResult] = await connection.query(
        `INSERT INTO ordenes (phone_number, customer_name, customer_address, total, shipping_cost, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.phoneNumber || orderData.phone_number,
          orderData.customerName || orderData.customer_name || null,
          orderData.customerAddress || orderData.customer_address || null,
          orderData.total,
          orderData.shippingCost || orderData.shipping_cost || 0,
          orderData.status || 'pending',
          orderData.notes || null
        ]
      );

      const ordenId = orderResult.insertId;

      // 2. Insertar cada item de la orden
      if (orderData.items && orderData.items.length > 0) {
        for (const item of orderData.items) {
          const productId = item.productId || item.product_id || item.id;
          const subtotal = item.price * item.quantity;

          await connection.query(
            `INSERT INTO orden_items (orden_id, product_id, product_name, quantity, price, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [ordenId, productId || null, item.name || item.product_name, item.quantity, item.price, subtotal]
          );

          // Stock NO se descuenta aquí — se descuenta cuando la orden pasa a 'completed'
        }
      }

      await connection.commit();
      return await OrderModel.findById(ordenId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Actualizar orden
   */
  static async update(id, orderData) {
    const fields = [];
    const values = [];

    const mapping = {
      phoneNumber: 'phone_number', phone_number: 'phone_number',
      customerName: 'customer_name', customer_name: 'customer_name',
      customerAddress: 'customer_address', customer_address: 'customer_address',
      total: 'total', shippingCost: 'shipping_cost', shipping_cost: 'shipping_cost',
      status: 'status', notes: 'notes', viewed: 'viewed'
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (orderData[key] !== undefined) {
        fields.push(`${column} = ?`);
        values.push(orderData[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE ordenes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return await OrderModel.findById(id);
  }

  /**
   * Actualizar estado de la orden
   */
  static async updateStatus(id, status) {
    return await OrderModel.update(id, { status });
  }

  /**
   * Marcar orden como vista
   */
  static async markAsViewed(id) {
    return await OrderModel.update(id, { viewed: true });
  }

  /**
   * Eliminar orden (CASCADE borra los items automáticamente)
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM ordenes WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static async getStats() {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS totalOrders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedOrders,
        SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) AS totalRevenue,
        AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END) AS averageOrderValue,
        COUNT(DISTINCT phone_number) AS uniqueCustomers
      FROM ordenes
    `);
    return rows[0];
  }
}

module.exports = OrderModel;

