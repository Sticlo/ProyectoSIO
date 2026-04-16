-- ============================================
-- BASE DE DATOS - Sistema de Gestión
-- Fecha: 2026-02-24
-- ============================================

-- ============================================
-- RELACIONES DEL SISTEMA:
--
--   usuarios (1) ──→ (N) movimientos_inventario    (un usuario registra muchos movimientos)
--   usuarios (1) ──→ (N) gastos                    (un usuario registra muchos gastos)
--
--   categorias (1) ──→ (N) productos               (una categoría tiene muchos productos)
--   categorias (1) ──→ (N) gastos                  (una categoría tiene muchos gastos)
--
--   ordenes (1) ──→ (N) orden_items                (una orden tiene muchos items)
--   productos (1) ──→ (N) orden_items              (un producto aparece en muchos items)
--     └─ orden_items = tabla puente (M:N) entre ordenes ↔ productos
--
--   productos (1) ──→ (N) movimientos_inventario   (un producto tiene muchos movimientos)
--
--   chat_messages → independiente (mensajes de chatbot/whatsapp)
-- ============================================

DROP DATABASE IF EXISTS sistema_gestion;
CREATE DATABASE sistema_gestion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_gestion;

-- ============================================
-- 1. TABLA: usuarios
--    (sin dependencias - se crea primero)
-- ============================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TABLA: categorias
--    (sin dependencias - se crea primero)
--    type: 'producto' o 'gasto' para separar usos
-- ============================================
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías de productos
INSERT INTO categorias (name, type, description) VALUES
('AURICULARES', 'producto', 'Auriculares y audífonos de todas las gamas'),
('BOCINAS', 'producto', 'Bocinas y altavoces bluetooth y con cable'),
('SMARTWATCH', 'producto', 'Relojes inteligentes y accesorios'),
('CARGADORES', 'producto', 'Cargadores rápidos, cables y adaptadores'),
('ALMACENAMIENTO', 'producto', 'Memorias USB, tarjetas SD y discos externos'),
('ACCESORIOS', 'producto', 'Accesorios diversos para dispositivos electrónicos');

-- Insertar categorías de gastos
INSERT INTO categorias (name, type, description) VALUES
('Renta', 'gasto', 'Pago de renta del local'),
('Servicios', 'gasto', 'Luz, agua, internet, etc.'),
('Inventario', 'gasto', 'Compra de productos para reventa'),
('Personal', 'gasto', 'Salarios y pagos a empleados'),
('Marketing', 'gasto', 'Publicidad y promoción'),
('Mantenimiento', 'gasto', 'Reparaciones y mantenimiento del local'),
('Otros', 'gasto', 'Gastos varios no categorizados');

-- ============================================
-- 3. TABLA: productos
--    FK: category_id → categorias(id)
-- ============================================
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    badge VARCHAR(50),
    image MEDIUMTEXT,
    in_stock BOOLEAN DEFAULT true,
    stock_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- ============================================
-- 4. TABLA: ordenes
--    (sin FK - los clientes no son usuarios del sistema)
-- ============================================
CREATE TABLE ordenes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    customer_address TEXT,
    total DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    viewed BOOLEAN DEFAULT false,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 5. TABLA: orden_items
--    TABLA PUENTE (M:N) entre ordenes ↔ productos
--    FK: orden_id → ordenes(id)
--    FK: product_id → productos(id)
-- ============================================
CREATE TABLE orden_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orden_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES productos(id) ON DELETE SET NULL
);

-- ============================================
-- 6. TABLA: gastos
--    FK: category_id → categorias(id)
--    FK: created_by → usuarios(id)
-- ============================================
CREATE TABLE gastos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category_id INT,
    category_name VARCHAR(100),
    type VARCHAR(50) DEFAULT 'operational',
    status VARCHAR(20) DEFAULT 'paid',
    product_name VARCHAR(255),
    quantity INT,
    date DATE NOT NULL,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- 7. TABLA: movimientos_inventario
--    FK: product_id → productos(id)
--    FK: created_by → usuarios(id)
-- ============================================
CREATE TABLE movimientos_inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- 8. TABLA: chat_messages
--    (independiente - mensajes de chatbot/whatsapp)
-- ============================================
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255),
    phone_number VARCHAR(20),
    message TEXT NOT NULL,  
    sender VARCHAR(50) NOT NULL,
    is_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================

-- 9. TABLA: notificaciones
--    Registra eventos del sistema:
--    - failed_sale: intento de venta sin stock
--    - new_order:   pedido creado exitosamente
--    - low_stock:   producto con stock bajo
--    - comment:     comentario o mensaje recibido
-- ============================================
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('failed_sale', 'new_order', 'low_stock', 'comment') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USUARIO ADMINISTRADOR INICIAL
-- ============================================
-- Credenciales por defecto:
--   Email: admin@tienda.com
--   Password: admin123
--
-- IMPORTANTE: Cambia la contraseña después del primer login
-- ============================================

INSERT INTO usuarios (email, password, name, role) VALUES 
('admin@tienda.com', '$2b$10$S/21gWUz2e1wi8pHKdSQJ.i4uVmpb6DWgsNZwKqzayDhgHaysQMhq', 'Administrador', 'admin');

-- ============================================
-- ACTUALIZAR PRODUCTOS SIN CATEGORÍA
-- ============================================
-- Asigna la categoría "ACCESORIOS" a productos que no tienen category_id
UPDATE productos 
SET category_id = (SELECT id FROM categorias WHERE name = 'ACCESORIOS' AND type = 'producto' LIMIT 1)
WHERE category_id IS NULL;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
