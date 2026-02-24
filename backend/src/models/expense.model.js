const { pool } = require('../config/database');

class ExpenseModel {
  /**
   * Obtener todos los gastos (con nombre de categoría y usuario creador)
   */
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT g.*, c.name AS category_name, u.name AS created_by_name
      FROM gastos g
      LEFT JOIN categorias c ON g.category_id = c.id
      LEFT JOIN usuarios u ON g.created_by = u.id
      ORDER BY g.date DESC
    `);
    return rows;
  }

  /**
   * Buscar gasto por ID
   */
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT g.*, c.name AS category_name, u.name AS created_by_name
      FROM gastos g
      LEFT JOIN categorias c ON g.category_id = c.id
      LEFT JOIN usuarios u ON g.created_by = u.id
      WHERE g.id = ?
    `, [id]);
    return rows[0] || null;
  }

  /**
   * Buscar gastos por category_id
   */
  static async findByCategory(categoryId) {
    const [rows] = await pool.query(`
      SELECT g.*, c.name AS category_name
      FROM gastos g
      LEFT JOIN categorias c ON g.category_id = c.id
      WHERE g.category_id = ?
      ORDER BY g.date DESC
    `, [categoryId]);
    return rows;
  }

  /**
   * Buscar gastos por rango de fechas
   */
  static async findByDateRange(startDate, endDate) {
    const [rows] = await pool.query(`
      SELECT g.*, c.name AS category_name
      FROM gastos g
      LEFT JOIN categorias c ON g.category_id = c.id
      WHERE g.date BETWEEN ? AND ?
      ORDER BY g.date DESC
    `, [startDate, endDate]);
    return rows;
  }

  /**
   * Crear nuevo gasto
   * FK: category_id → categorias(id), created_by → usuarios(id)
   */
  static async create(expenseData) {
    const { description, amount, category_id, date, notes, created_by } = expenseData;

    const [result] = await pool.query(
      `INSERT INTO gastos (description, amount, category_id, date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [description, amount, category_id || null, date || new Date(), notes || null, created_by || null]
    );

    return await ExpenseModel.findById(result.insertId);
  }

  /**
   * Actualizar gasto
   */
  static async update(id, expenseData) {
    const fields = [];
    const values = [];

    const allowedFields = {
      description: 'description', amount: 'amount',
      category_id: 'category_id', date: 'date', notes: 'notes'
    };

    for (const [key, column] of Object.entries(allowedFields)) {
      if (expenseData[key] !== undefined) {
        fields.push(`${column} = ?`);
        values.push(expenseData[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE gastos SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return await ExpenseModel.findById(id);
  }

  /**
   * Eliminar gasto
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM gastos WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Obtener total de gastos por categoría
   */
  static async getTotalByCategory() {
    const [rows] = await pool.query(`
      SELECT c.name AS category, COALESCE(SUM(g.amount), 0) AS total
      FROM gastos g
      LEFT JOIN categorias c ON g.category_id = c.id
      GROUP BY g.category_id, c.name
      ORDER BY total DESC
    `);
    // Convertir a objeto { category: total }
    const totals = {};
    rows.forEach(r => { totals[r.category || 'Sin categoría'] = parseFloat(r.total); });
    return totals;
  }

  /**
   * Obtener total de gastos en un período
   */
  static async getTotalByPeriod(startDate, endDate) {
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM gastos WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    return parseFloat(rows[0].total);
  }
}

module.exports = ExpenseModel;

