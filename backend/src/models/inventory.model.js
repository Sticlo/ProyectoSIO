const { pool } = require('../config/database');

class InventoryModel {
  /**
   * Obtener todos los movimientos de inventario (con nombre de producto y usuario)
   */
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT m.*, p.name AS product_name, u.name AS user_name
      FROM movimientos_inventario m
      LEFT JOIN productos p ON m.product_id = p.id
      LEFT JOIN usuarios u ON m.created_by = u.id
      ORDER BY m.created_at DESC
    `);
    return rows;
  }

  /**
   * Obtener movimientos de un producto específico
   */
  static async getByProduct(productId) {
    const [rows] = await pool.query(`
      SELECT m.*, p.name AS product_name, u.name AS user_name
      FROM movimientos_inventario m
      LEFT JOIN productos p ON m.product_id = p.id
      LEFT JOIN usuarios u ON m.created_by = u.id
      WHERE m.product_id = ?
      ORDER BY m.created_at DESC
    `, [productId]);
    return rows;
  }

  /**
   * Registrar movimiento de inventario y actualizar stock
   * FK: product_id → productos(id), created_by → usuarios(id)
   */
  static async createMovement(movementData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { product_id, type, quantity, reason, notes, created_by } = movementData;

      // 1. Registrar el movimiento
      const [result] = await connection.query(
        `INSERT INTO movimientos_inventario (product_id, type, quantity, reason, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, type, quantity, reason || null, notes || null, created_by || null]
      );

      // 2. Actualizar stock del producto
      if (type === 'in') {
        await connection.query(
          'UPDATE productos SET stock_count = stock_count + ?, in_stock = true WHERE id = ?',
          [quantity, product_id]
        );
      } else {
        await connection.query(
          `UPDATE productos 
           SET stock_count = stock_count - ?,
               in_stock = CASE WHEN (stock_count - ?) > 0 THEN true ELSE false END
           WHERE id = ?`,
          [quantity, quantity, product_id]
        );
      }

      await connection.commit();

      // Retornar el movimiento creado con info de producto
      const [rows] = await pool.query(`
        SELECT m.*, p.name AS product_name, p.stock_count AS new_stock
        FROM movimientos_inventario m
        LEFT JOIN productos p ON m.product_id = p.id
        WHERE m.id = ?
      `, [result.insertId]);

      return rows[0];

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener resumen de inventario
   */
  static async getSummary() {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS totalProducts,
        SUM(CASE WHEN in_stock = true THEN 1 ELSE 0 END) AS inStockCount,
        SUM(CASE WHEN in_stock = false OR stock_count = 0 THEN 1 ELSE 0 END) AS outOfStockCount,
        SUM(CASE WHEN stock_count > 0 AND stock_count < 10 THEN 1 ELSE 0 END) AS lowStockCount,
        COALESCE(SUM(stock_count * price), 0) AS totalValue
      FROM productos
    `);
    return rows[0];
  }

  /**
   * Obtener productos con bajo stock
   */
  static async getLowStock(threshold = 10) {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      WHERE p.stock_count > 0 AND p.stock_count < ?
      ORDER BY p.stock_count ASC
    `, [threshold]);
    return rows;
  }

  /**
   * Obtener productos sin stock
   */
  static async getOutOfStock() {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      WHERE p.in_stock = false OR p.stock_count = 0
      ORDER BY p.name
    `);
    return rows;
  }
}

module.exports = InventoryModel;
