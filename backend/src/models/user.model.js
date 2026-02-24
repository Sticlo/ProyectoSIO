const { pool } = require('../config/database');

class UserModel {
  /**
   * Obtener todos los usuarios (sin password)
   */
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM usuarios'
    );
    return rows;
  }

  /**
   * Buscar usuario por ID (sin password)
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Buscar usuario por email (incluye password para autenticación)
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Crear nuevo usuario
   */
  static async create(userData) {
    const { email, password, name, role } = userData;
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, password, name, role || 'user']
    );
    return await UserModel.findById(result.insertId);
  }

  /**
   * Actualizar usuario
   */
  static async update(id, userData) {
    const fields = [];
    const values = [];

    if (userData.name !== undefined) { fields.push('name = ?'); values.push(userData.name); }
    if (userData.email !== undefined) { fields.push('email = ?'); values.push(userData.email); }
    if (userData.password !== undefined) { fields.push('password = ?'); values.push(userData.password); }
    if (userData.role !== undefined) { fields.push('role = ?'); values.push(userData.role); }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return await UserModel.findById(id);
  }

  /**
   * Eliminar usuario
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;

