const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas (lectura)
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Rutas protegidas (solo administradores)
router.post('/', authenticateToken, isAdmin, ProductController.create);
router.put('/:id', authenticateToken, isAdmin, ProductController.update);
router.patch('/:id/stock', authenticateToken, isAdmin, ProductController.updateStock);
router.delete('/:id', authenticateToken, isAdmin, ProductController.delete);

module.exports = router;
