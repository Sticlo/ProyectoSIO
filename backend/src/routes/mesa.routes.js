const express = require('express');
const router = express.Router();
const MesaController = require('../controllers/mesa.controller');

// Rutas PÚBLICAS — accesibles desde el QR sin autenticación
// POST /api/mesa/:mesaId/chat  → chat con el mesero
// GET  /api/mesa/:mesaId/carta → obtener la carta en JSON

router.get('/:mesaId/carta', MesaController.getCarta);
router.post('/:mesaId/chat', MesaController.chat);

module.exports = router;
