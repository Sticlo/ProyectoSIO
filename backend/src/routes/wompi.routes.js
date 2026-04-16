const express = require('express');
const router = express.Router();
const WompiController = require('../controllers/wompi.controller');

// POST /api/wompi/signature  →  genera firma + referencia para el widget
router.post('/signature', WompiController.getSignatureData);

// GET  /api/wompi/transaction/:id  →  consulta estado de una transacción
router.get('/transaction/:id', WompiController.getTransaction);

// POST /api/wompi/webhook  →  eventos de Wompi (sin raw body; recibe JSON normal)
router.post('/webhook', WompiController.webhook);

module.exports = router;
