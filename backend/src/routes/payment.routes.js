const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');

// ─── Tarjeta crédito / débito ────────────────────────────────────────────────
// POST /api/payments/create-intent
router.post('/create-intent', PaymentController.createCardIntent);

// PSE desactivado - no soportado por Stripe en esta región
// router.post('/create-pse-intent', PaymentController.createPSEIntent);
// router.post('/confirm-pse', PaymentController.confirmPSE);

// ─── Estado del pago ────────────────────────────────────────────────────────
// GET /api/payments/status/:paymentIntentId
router.get('/status/:paymentIntentId', PaymentController.getPaymentStatus);

// ─── Webhook (debe registrarse con raw body en server.js) ───────────────────
// POST /api/payments/webhook
router.post('/webhook', PaymentController.webhook);

module.exports = router;
