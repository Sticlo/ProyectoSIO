/**
 * Script para crear usuario administrador inicial
 * Ejecutar con: node src/scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');
    
    const email = 'admin@tienda.com';
    const password = 'admin123';
    const name = 'Administrador';
    const role = 'admin';

    // Verificar si el usuario ya existe
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log('⚠️  El usuario admin@tienda.com ya existe');
      console.log('   ID:', existing[0].id);
      
      // Actualizar la contraseña si es necesario
      const updatePassword = true; // Cambiar a false si no quieres actualizar
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('UPDATE usuarios SET password = ? WHERE email = ?', [hashedPassword, email]);
        console.log('✅ Contraseña actualizada correctamente');
      }
    } else {
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insertar usuario
      const [result] = await pool.query(
        'INSERT INTO usuarios (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role]
      );
      
      console.log('✅ Usuario administrador creado exitosamente');
      console.log('   ID:', result.insertId);
    }
    
    console.log('\n📋 Credenciales de acceso:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login en producción\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  }
}

createAdminUser();
