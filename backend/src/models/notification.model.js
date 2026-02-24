const { pool } = require('../config/database');

class NotificationModel {
  /**
   * Crear una notificación
   * @param {Object} data - { type, title, message, data }
   */
  static async create({ type, title, message = null, data = null }) {
    const [result] = await pool.query(
      `INSERT INTO notificaciones (type, title, message, data)
       VALUES (?, ?, ?, ?)`,
      [type, title, message, data ? JSON.stringify(data) : null]
    );

    return NotificationModel.findById(result.insertId);
  }

  /**
   * Obtener todas las notificaciones (más recientes primero)
   */
  static async getAll({ onlyUnread = false, limit = 50 } = {}) {
    const where = onlyUnread ? 'WHERE is_read = false' : '';
    const [rows] = await pool.query(
      `SELECT * FROM notificaciones
       ${where}
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  /**
   * Obtener por ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM notificaciones WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Contar no leídas
   */
  static async countUnread() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM notificaciones WHERE is_read = false'
    );
    return rows[0].count;
  }

  /**
   * Marcar como leída
   */
  static async markAsRead(id) {
    await pool.query(
      'UPDATE notificaciones SET is_read = true, read_at = NOW() WHERE id = ?',
      [id]
    );
    return NotificationModel.findById(id);
  }

  /**
   * Marcar todas como leídas
   */
  static async markAllAsRead() {
    const [result] = await pool.query(
      'UPDATE notificaciones SET is_read = true, read_at = NOW() WHERE is_read = false'
    );
    return result.affectedRows;
  }

  /**
   * Eliminar una notificación
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM notificaciones WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = NotificationModel;
