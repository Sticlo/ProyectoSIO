const mysql = require('mysql2/promise');
const path = require('path');

// Asegurar que las variables de entorno estén cargadas desde la ruta correcta
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Pool de conexiones reutilizable
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_gestion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Verificar conexión a la base de datos
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
