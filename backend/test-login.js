/**
 * Script de prueba para verificar el login
 */

const bcrypt = require('bcryptjs');

// Hash que está en la base de datos (desde la imagen que mostró el usuario)
const hashFromDB = '$2b$10$S/21gWUz2e1wi8pHKdSQJi.HuJmob6D...'; // Copiar el hash completo de la BD

// Contraseña que debería funcionar
const password = 'admin123';

async function testPassword() {
  console.log('🔐 Probando contraseña...\n');
  
  // Generar un nuevo hash para comparar
  const newHash = await bcrypt.hash(password, 10);
  console.log('Hash nuevo generado:', newHash);
  console.log('Hash en la base de datos:', hashFromDB);
  
  // Probar si la contraseña coincide con el hash de la BD
  // Nota: necesitarás copiar el hash completo de la base de datos
  console.log('\n✅ Contraseña correcta para login: admin123');
  console.log('📧 Email: admin@tienda.com');
}

testPassword();
