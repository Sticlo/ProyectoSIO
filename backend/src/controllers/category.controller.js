const CategoryModel = require('../models/category.model');

class CategoryController {
  /**
   * Obtener todas las categorías (filtrar por tipo si se envía query)
   */
  static async getAll(req, res) {
    try {
      const { type } = req.query;
      
      let categories;
      if (type) {
        categories = await CategoryModel.getByType(type);
      } else {
        categories = await CategoryModel.getAll();
      }

      res.json({
        count: categories.length,
        categories
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  }

  /**
   * Obtener categoría por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);

      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json({ category });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({ error: 'Error al obtener categoría' });
    }
  }

  /**
   * Crear nueva categoría
   */
  static async create(req, res) {
    try {
      const { name, type, description } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          error: 'Nombre y tipo son requeridos'
        });
      }

      if (!['producto', 'gasto'].includes(type)) {
        return res.status(400).json({
          error: 'Tipo debe ser "producto" o "gasto"'
        });
      }

      const newCategory = await CategoryModel.create({ name, type, description });

      res.status(201).json({
        message: 'Categoría creada exitosamente',
        category: newCategory
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }

  /**
   * Actualizar categoría
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;

      const updatedCategory = await CategoryModel.update(id, categoryData);

      if (!updatedCategory) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json({
        message: 'Categoría actualizada exitosamente',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }

  /**
   * Eliminar categoría
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await CategoryModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ error: 'Error al eliminar categoría' });
    }
  }
}

module.exports = CategoryController;
