const { pool } = require('../config/database');

class CategoryModel {
  /**
   * Obtener todas las categorías
   */
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM categorias ORDER BY type, name'
    );
    return rows;
  }

  /**
   * Obtener categorías por tipo ('producto' o 'gasto')
   */
  static async getByType(type) {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE type = ? ORDER BY name',
      [type]
    );
    return rows;
  }

  /**
   * Buscar categoría por ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Buscar categoría por nombre y tipo
   */
  static async findByNameAndType(name, type) {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE name = ? AND type = ?',
      [name, type]
    );
    return rows[0] || null;
  }

  /**
   * Crear nueva categoría
   */
  static async create(categoryData) {
    const { name, type, description } = categoryData;
    const [result] = await pool.query(
      'INSERT INTO categorias (name, type, description) VALUES (?, ?, ?)',
      [name, type, description || null]
    );
    return await CategoryModel.findById(result.insertId);
  }

  /**
   * Actualizar categoría
   */
  static async update(id, categoryData) {
    const fields = [];
    const values = [];

    if (categoryData.name !== undefined) { fields.push('name = ?'); values.push(categoryData.name); }
    if (categoryData.type !== undefined) { fields.push('type = ?'); values.push(categoryData.type); }
    if (categoryData.description !== undefined) { fields.push('description = ?'); values.push(categoryData.description); }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE categorias SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return await CategoryModel.findById(id);
  }

  /**
   * Eliminar categoría
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM categorias WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;
