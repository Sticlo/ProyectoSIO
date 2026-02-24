const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas de órdenes
// POST es público: los clientes crean órdenes sin estar autenticados
router.post('/', OrderController.create);

// El resto requiere autenticación
router.use(authenticateToken);
router.get('/', OrderController.getAll);
router.get('/stats', OrderController.getStats);
router.get('/:id', OrderController.getById);
router.put('/:id', isAdmin, OrderController.update);
router.patch('/:id/status', isAdmin, OrderController.updateStatus);
router.patch('/:id/viewed', isAdmin, OrderController.markAsViewed);
router.delete('/:id', isAdmin, OrderController.delete);

module.exports = router;
