const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expense.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken);
router.use(isAdmin);

// Rutas de gastos
router.get('/', ExpenseController.getAll);
router.get('/totals/category', ExpenseController.getTotalByCategory);
router.get('/totals/period', ExpenseController.getTotalByPeriod);
router.get('/:id', ExpenseController.getById);
router.post('/', ExpenseController.create);
router.put('/:id', ExpenseController.update);
router.delete('/:id', ExpenseController.delete);

module.exports = router;
