/**
 * Script para insertar categorías iniciales en la base de datos
 * Ejecutar con: node src/scripts/seed-categories.js
 */

const { pool } = require('../config/database');

const productCategories = [
  { name: 'AURICULARES', type: 'producto', description: 'Auriculares y audífonos de todas las gamas' },
  { name: 'BOCINAS', type: 'producto', description: 'Bocinas y altavoces bluetooth y con cable' },
  { name: 'SMARTWATCH', type: 'producto', description: 'Relojes inteligentes y accesorios' },
  { name: 'CARGADORES', type: 'producto', description: 'Cargadores rápidos, cables y adaptadores' },
  { name: 'ALMACENAMIENTO', type: 'producto', description: 'Memorias USB, tarjetas SD y discos externos' },
  { name: 'ACCESORIOS', type: 'producto', description: 'Accesorios diversos para dispositivos electrónicos' }
];

const expenseCategories = [
  { name: 'Renta', type: 'gasto', description: 'Pago de renta del local' },
  { name: 'Servicios', type: 'gasto', description: 'Luz, agua, internet, etc.' },
  { name: 'Inventario', type: 'gasto', description: 'Compra de productos para reventa' },
  { name: 'Personal', type: 'gasto', description: 'Salarios y pagos a empleados' },
  { name: 'Marketing', type: 'gasto', description: 'Publicidad y promoción' },
  { name: 'Mantenimiento', type: 'gasto', description: 'Reparaciones y mantenimiento del local' },
  { name: 'Otros', type: 'gasto', description: 'Gastos varios no categorizados' }
];

async function seedCategories() {
  try {
    console.log('📦 Insertando categorías...');
    
    const allCategories = [...productCategories, ...expenseCategories];
    
    for (const category of allCategories) {
      // Verificar si ya existe
      const [existing] = await pool.query(
        'SELECT id FROM categorias WHERE name = ? AND type = ?',
        [category.name, category.type]
      );
      
      if (existing.length > 0) {
        console.log(`   ⏭️  ${category.name} (${category.type}) ya existe`);
      } else {
        // Insertar
        await pool.query(
          'INSERT INTO categorias (name, type, description) VALUES (?, ?, ?)',
          [category.name, category.type, category.description]
        );
        console.log(`   ✅ ${category.name} (${category.type}) creada`);
      }
    }
    
    console.log('\n✅ Categorías insertadas exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar categorías:', error.message);
    process.exit(1);
  }
}

seedCategories();
