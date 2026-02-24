const ProductModel = require('../models/product.model');

class ProductController {
  /**
   * Obtener todos los productos
   */
  static async getAll(req, res) {
    try {
      const { category, search } = req.query;
      
      let products;

      if (search) {
        products = await ProductModel.search(search);
      } else if (category) {
        // Soportar búsqueda por ID o por nombre de categoría
        const categoryId = parseInt(category);
        if (!isNaN(categoryId)) {
          products = await ProductModel.findByCategory(categoryId);
        } else {
          products = await ProductModel.findByCategoryName(category);
        }
      } else {
        products = await ProductModel.getAll();
      }

      res.json({ 
        count: products.length,
        products 
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  /**
   * Obtener producto por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ product });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }

  /**
   * Crear nuevo producto
   */
  static async create(req, res) {
    try {
      const productData = req.body;

      // Validar campos requeridos
      if (!productData.name || !productData.price) {
        return res.status(400).json({ 
          error: 'Nombre y precio son requeridos' 
        });
      }

      const newProduct = await ProductModel.create(productData);

      res.status(201).json({
        message: 'Producto creado exitosamente',
        product: newProduct
      });
    } catch (error) {
      console.error('Error al crear producto:', error.message, error.sqlMessage);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }

  /**
   * Actualizar producto
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;

      const updatedProduct = await ProductModel.update(id, productData);

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({
        message: 'Producto actualizado exitosamente',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }

  /**
   * Actualizar stock de producto
   */
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return res.status(400).json({ 
          error: 'La cantidad es requerida' 
        });
      }

      const updatedProduct = await ProductModel.updateStock(id, quantity);

      if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({
        message: 'Stock actualizado exitosamente',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ error: 'Error al actualizar stock' });
    }
  }

  /**
   * Eliminar producto
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProductModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
}

module.exports = ProductController;

module.exports = ProductController;
