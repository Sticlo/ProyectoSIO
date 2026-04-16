const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventory.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken);
router.use(isAdmin);

// Rutas de inventario
router.get('/movements', InventoryController.getMovements);
router.get('/summary', InventoryController.getSummary);
router.get('/low-stock', InventoryController.getLowStock);
router.get('/out-of-stock', InventoryController.getOutOfStock);
router.post('/adjust', InventoryController.adjustStock);

module.exports = router;
