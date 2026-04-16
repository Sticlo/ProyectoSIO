/**
 * Script para actualizar productos existentes y asignarles category_id
 * Ejecutar con: node src/scripts/update-product-categories.js
 */

const { pool } = require('../config/database');

async function updateProductCategories() {
  try {
    console.log('🔄 Actualizando categorías de productos...\n');
    
    // Obtener todas las categorías de productos
    const [categories] = await pool.query(
      'SELECT id, name FROM categorias WHERE type = ?',
      ['producto']
    );
    
    if (categories.length === 0) {
      console.log('❌ No hay categorías de productos. Ejecuta primero seed-categories.js');
      process.exit(1);
    }
    
    console.log('📋 Categorías disponibles:');
    categories.forEach(cat => {
      console.log(`   ${cat.id}: ${cat.name}`);
    });
    console.log('');
    
    // Obtener productos sin categoría
    const [products] = await pool.query(
      'SELECT id, name, category_id FROM productos WHERE category_id IS NULL'
    );
    
    if (products.length === 0) {
      console.log('✅ Todos los productos ya tienen categoría asignada\n');
      process.exit(0);
    }
    
    console.log(`🔍 Encontrados ${products.length} productos sin categoría:\n`);
    
    // Mapeo inteligente basado en palabras clave en el nombre del producto
    const categoryKeywords = {
      'AURICULARES': ['auricular', 'headphone', 'earbud', 'airpod', 'audifonos'],
      'BOCINAS': ['bocina', 'speaker', 'altavoz', 'parlante', 'jbl'],
      'SMARTWATCH': ['watch', 'reloj', 'smartwatch', 'band', 'fit'],
      'CARGADORES': ['cargador', 'charger', 'cable', 'usb', 'lightning', 'tipo c'],
      'ALMACENAMIENTO': ['memoria', 'usb', 'pendrive', 'sd', 'microsd', 'disco', 'ssd'],
      'ACCESORIOS': ['funda', 'protector', 'soporte', 'base', 'adaptador', 'mica']
    };
    
    let updated = 0;
    
    for (const product of products) {
      let assignedCategory = null;
      const productNameLower = product.name.toLowerCase();
      
      // Buscar coincidencia por palabras clave
      for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => productNameLower.includes(keyword))) {
          assignedCategory = categories.find(c => c.name === categoryName);
          break;
        }
      }
      
      // Si no se encuentra, asignar ACCESORIOS por defecto
      if (!assignedCategory) {
        assignedCategory = categories.find(c => c.name === 'ACCESORIOS');
      }
      
      if (assignedCategory) {
        await pool.query(
          'UPDATE productos SET category_id = ? WHERE id = ?',
          [assignedCategory.id, product.id]
        );
        console.log(`   ✅ ${product.name} → ${assignedCategory.name}`);
        updated++;
      }
    }
    
    console.log(`\n✅ ${updated} productos actualizados exitosamente\n`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al actualizar categorías:', error.message);
    process.exit(1);
  }
}

updateProductCategories();
