const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno ANTES de importar módulos que las usan
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const expenseRoutes = require('./routes/expense.routes');
const categoryRoutes = require('./routes/category.routes');
const chatRoutes = require('./routes/chat.routes');
const mesaRoutes = require('./routes/mesa.routes'); // 🆕 Mesero digital QR
const notificationRoutes = require('./routes/notification.routes');

// Importar conexión a base de datos
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
}));
// Aumentar límite para permitir imágenes base64 (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'API Backend - Sistema de Gestión',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      inventory: '/api/inventory',
      expenses: '/api/expenses',
      categories: '/api/categories',
      chat: '/api/chat',
      mesa: '/api/mesa/:mesaId/chat', // 🆕
      notifications: '/api/notifications'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mesa', mesaRoutes); // 🆕 Ruta pública del mesero
app.use('/api/notifications', notificationRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Mesero digital: http://localhost:${PORT}/api/mesa/:mesaId/chat`);

  // Verificar conexión a base de datos
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('⚠️  No se pudo conectar a MySQL. Verifica la configuración de la base de datos.');
  }
});
