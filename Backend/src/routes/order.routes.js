const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de órdenes
router.get('/', OrderController.getAll);
router.get('/stats', OrderController.getStats);
router.get('/:id', OrderController.getById);
router.post('/', OrderController.create);
router.put('/:id', isAdmin, OrderController.update);
router.patch('/:id/status', isAdmin, OrderController.updateStatus);
router.patch('/:id/viewed', isAdmin, OrderController.markAsViewed);
router.delete('/:id', isAdmin, OrderController.delete);

module.exports = router;
