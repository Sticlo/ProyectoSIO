const { pool } = require('../config/database');

class ProductModel {
  /**
   * Obtener todos los productos (con nombre de categoría)
   */
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  /**
   * Buscar producto por ID
   */
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  }

  /**
   * Buscar productos por category_id
   */
  static async findByCategory(categoryId) {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `, [categoryId]);
    return rows;
  }

  /**
   * Buscar productos por nombre de categoría
   */
  static async findByCategoryName(categoryName) {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      WHERE c.name LIKE ?
      ORDER BY p.created_at DESC
    `, [`%${categoryName}%`]);
    return rows;
  }

  /**
   * Buscar productos (por nombre o descripción)
   */
  static async search(query) {
    const term = `%${query}%`;
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM productos p
      LEFT JOIN categorias c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?
      ORDER BY p.created_at DESC
    `, [term, term, term]);
    return rows;
  }

  /**
   * Crear nuevo producto
   */
  static async create(productData) {
    const {
      name, category_id, description, price, original_price,
      rating, review_count, badge, image, in_stock, stock_count
    } = productData;

    const [result] = await pool.query(
      `INSERT INTO productos 
        (name, category_id, description, price, original_price, rating, review_count, badge, image, in_stock, stock_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id || null, description || null, price, original_price || null,
       rating || 0, review_count || 0, badge || null, image || null,
       in_stock !== undefined ? in_stock : true, stock_count || 0]
    );

    return await ProductModel.findById(result.insertId);
  }

  /**
   * Actualizar producto
   */
  static async update(id, productData) {
    const fields = [];
    const values = [];

    const allowedFields = {
      name: 'name', category_id: 'category_id', description: 'description',
      price: 'price', original_price: 'original_price', rating: 'rating',
      review_count: 'review_count', badge: 'badge', image: 'image',
      in_stock: 'in_stock', stock_count: 'stock_count'
    };

    for (const [key, column] of Object.entries(allowedFields)) {
      if (productData[key] !== undefined) {
        fields.push(`${column} = ?`);
        values.push(productData[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return await ProductModel.findById(id);
  }

  /**
   * Actualizar stock del producto
   */
  static async updateStock(id, quantity) {
    const product = await ProductModel.findById(id);
    if (!product) return null;

    const newStock = product.stock_count + quantity;
    const [result] = await pool.query(
      'UPDATE productos SET stock_count = ?, in_stock = ? WHERE id = ?',
      [newStock, newStock > 0, id]
    );

    if (result.affectedRows === 0) return null;
    return await ProductModel.findById(id);
  }

  /**
   * Eliminar producto
   */
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM productos WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ProductModel;

