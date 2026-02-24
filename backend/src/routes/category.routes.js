const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas (lectura)
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Rutas protegidas (solo administradores)
router.post('/', authenticateToken, isAdmin, CategoryController.create);
router.put('/:id', authenticateToken, isAdmin, CategoryController.update);
router.delete('/:id', authenticateToken, isAdmin, CategoryController.delete);

module.exports = router;
