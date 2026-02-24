const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Ruta protegida - solo administradores pueden usar el chatbot
router.post('/', authenticateToken, ChatController.sendMessage);

module.exports = router;
