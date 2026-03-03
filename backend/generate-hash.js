const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash para password "admin123":');
  console.log(hash);
  
  // Verificar que funciona
  const isValid = await bcrypt.compare(password, hash);
  console.log('\nVerificación:', isValid ? 'OK ✓' : 'ERROR ✗');
}

generateHash();
