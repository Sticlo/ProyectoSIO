-- ============================================
-- MIGRACIÓN: Agregar índice UNIQUE al email
-- ============================================
-- Este script actualiza la tabla usuarios para:
-- 1. Agregar índice UNIQUE al campo email
-- 2. Cambiar el rol por defecto a 'admin'
--
-- Ejecutar solo si ya tienes la base de datos creada
-- ============================================

USE sistema_gestion;

-- Agregar índice UNIQUE al email (si no existe)
ALTER TABLE usuarios 
ADD UNIQUE KEY unique_email (email);

-- Cambiar el rol por defecto a 'admin'
ALTER TABLE usuarios 
MODIFY COLUMN role VARCHAR(50) DEFAULT 'admin';

-- Verificar cambios
DESCRIBE usuarios;

SELECT 'Migración completada exitosamente' AS status;
