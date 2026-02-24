const { pool } = require('../config/database');

class ExpenseModel {
  /**
   * Obtener todos los gastos (con nombre de categoría y usuario creador)
   */
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT g.*, u.name AS created_by_name
      FROM gastos g
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
      SELECT g.*, u.name AS created_by_name
      FROM gastos g
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
      SELECT g.*
      FROM gastos g
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
      SELECT g.*
      FROM gastos g
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
    const { description, amount, category_id, category_name, type, status, product_name, quantity, date, notes, created_by } = expenseData;

    const sql = `INSERT INTO gastos (description, amount, category_id, category_name, type, status, product_name, quantity, date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const buildValues = (cbValue) => [
      description, amount,
      category_id  || null,
      category_name || null,
      type   || 'operational',
      status || 'paid',
      product_name || null,
      quantity     || null,
      date         || new Date(),
      notes        || null,
      cbValue
    ];

    let values = buildValues(created_by || null);
    console.log('🗄️  [ExpenseModel] INSERT values:', JSON.stringify(values));

    let result;
    try {
      [result] = await pool.query(sql, values);
    } catch (err) {
      // errno 1452 = FK constraint fail; si falla por created_by, reintenta sin él
      if ((err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') && created_by) {
        console.warn('⚠️  [ExpenseModel] created_by FK falla, reintentando con NULL');
        values = buildValues(null);
        [result] = await pool.query(sql, values);
      } else {
        throw err;
      }
    }

    console.log('🗄️  [ExpenseModel] insertId:', result.insertId);
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
      category_id: 'category_id', category_name: 'category_name',
      type: 'type', status: 'status',
      product_name: 'product_name', quantity: 'quantity',
      date: 'date', notes: 'notes'
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

