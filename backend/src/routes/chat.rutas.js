const express = require('express');
const enrutador = express.Router();
const ControladorChat = require('../controllers/chat.controlador');
const { authenticateToken } = require('../middleware/auth.middleware');

// Ruta protegida — solo usuarios autenticados pueden usar el chatbot
enrutador.post('/', authenticateToken, ControladorChat.enviarMensaje);

module.exports = enrutador;
