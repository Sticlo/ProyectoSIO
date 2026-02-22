const ProductModel = require('../models/product.model');

class ProductController {
  /**
   * Obtener todos los productos
   */
  static getAll(req, res) {
    try {
      const { category, search } = req.query;
      
      let products = ProductModel.getAll();

      // Filtrar por categoría si se proporciona
      if (category) {
        products = ProductModel.findByCategory(category);
      }

      // Buscar por término si se proporciona
      if (search) {
        products = ProductModel.search(search);
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
  static getById(req, res) {
    try {
      const { id } = req.params;
      const product = ProductModel.findById(id);

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
  static create(req, res) {
    try {
      const productData = req.body;

      // Validar campos requeridos
      if (!productData.name || !productData.price) {
        return res.status(400).json({ 
          error: 'Nombre y precio son requeridos' 
        });
      }

      const newProduct = ProductModel.create(productData);

      res.status(201).json({
        message: 'Producto creado exitosamente',
        product: newProduct
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }

  /**
   * Actualizar producto
   */
  static update(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;

      const updatedProduct = ProductModel.update(id, productData);

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
  static updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return res.status(400).json({ 
          error: 'La cantidad es requerida' 
        });
      }

      const updatedProduct = ProductModel.updateStock(id, quantity);

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
  static delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = ProductModel.delete(id);

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
