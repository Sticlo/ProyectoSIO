-- ============================================
-- Script de Base de Datos - Sistema de Gestión
-- MySQL Workbench
-- Fecha: 2026-02-22
-- ============================================

-- Crear base de datos
DROP DATABASE IF EXISTS sistema_gestion;
CREATE DATABASE sistema_gestion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_gestion;

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador por defecto
-- Password: admin123 (hash bcrypt)
INSERT INTO usuarios (email, password, name, role) VALUES 
('admin@tienda.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin');

-- ============================================
-- Tabla: productos
-- ============================================
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    badge VARCHAR(50),
    image VARCHAR(500),
    in_stock BOOLEAN DEFAULT true,
    stock_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_in_stock (in_stock),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar productos de ejemplo
INSERT INTO productos (name, category, description, price, original_price, rating, review_count, badge, image, in_stock, stock_count) VALUES
('AirBuds Pro Max', 'Auriculares', 'Sonido premium con cancelación de ruido activa y 40 horas de batería.', 199.00, 249.00, 4.8, 1542, 'Oferta', '/assets/placeholder-product.png', true, 25),
('SoundPulse Speaker', 'Bocinas', 'Potencia y claridad en un diseño compacto resistente al agua.', 149.00, NULL, 4.7, 892, NULL, '/assets/placeholder-product.png', true, 18),
('ChronoWave Watch', 'Smartwatch', 'Elegancia inteligente con monitoreo de salud 24/7.', 299.00, 349.00, 4.9, 2103, 'Popular', '/assets/placeholder-product.png', true, 32),
('ChargeHub Wireless', 'Cargadores', 'Carga rápida inalámbrica de última generación para 3 dispositivos.', 89.00, NULL, 4.6, 654, 'Nuevo', '/assets/placeholder-product.png', true, 45),
('Laptop UltraBook Pro', 'Laptops', 'Laptop ultraligera con procesador de última generación y 16GB RAM.', 1299.00, 1499.00, 4.8, 876, 'Oferta', '/assets/placeholder-product.png', true, 12),
('Mouse Ergonómico Pro', 'Accesorios', 'Diseño ergonómico con precisión láser y conectividad inalámbrica.', 49.00, NULL, 4.5, 432, NULL, '/assets/placeholder-product.png', true, 67),
('Teclado Mecánico RGB', 'Accesorios', 'Teclado mecánico con iluminación RGB personalizable.', 129.00, 159.00, 4.7, 1234, 'Popular', '/assets/placeholder-product.png', true, 28),
('Webcam HD Pro', 'Accesorios', 'Cámara web Full HD 1080p con micrófono integrado.', 79.00, NULL, 4.6, 567, NULL, '/assets/placeholder-product.png', true, 35);

-- ============================================
-- Tabla: ordenes
-- ============================================
CREATE TABLE ordenes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    customer_address TEXT,
    total DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-response') DEFAULT 'pending',
    notes TEXT,
    viewed BOOLEAN DEFAULT false,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone_number),
    INDEX idx_status (status),
    INDEX idx_date (date),
    INDEX idx_viewed (viewed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: orden_items (items de cada orden)
-- ============================================
CREATE TABLE orden_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orden_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_orden (orden_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: gastos
-- ============================================
CREATE TABLE gastos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar gastos de ejemplo
INSERT INTO gastos (description, amount, category, date, notes) VALUES
('Pago de renta del local', 8000.00, 'Renta', '2026-02-01', 'Renta mensual'),
('Electricidad', 1200.00, 'Servicios', '2026-02-05', 'Recibo de luz'),
('Internet y teléfono', 800.00, 'Servicios', '2026-02-05', 'Plan empresarial'),
('Compra de inventario', 15000.00, 'Inventario', '2026-02-10', 'Nueva mercancía'),
('Sueldos del personal', 12000.00, 'Nómina', '2026-02-15', 'Quincena 1');

-- ============================================
-- Tabla: movimientos_inventario (historial de cambios)
-- ============================================
CREATE TABLE movimientos_inventario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_product (product_id),
    INDEX idx_type (type),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: categorias (para productos y gastos)
-- ============================================
CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('producto', 'gasto') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías de productos
INSERT INTO categorias (name, type, description) VALUES
('Auriculares', 'producto', 'Auriculares y audífonos'),
('Bocinas', 'producto', 'Bocinas y altavoces'),
('Smartwatch', 'producto', 'Relojes inteligentes'),
('Cargadores', 'producto', 'Cargadores y cables'),
('Laptops', 'producto', 'Computadoras portátiles'),
('Accesorios', 'producto', 'Accesorios tecnológicos');

-- Insertar categorías de gastos
INSERT INTO categorias (name, type, description) VALUES
('Renta', 'gasto', 'Pago de alquiler de local'),
('Servicios', 'gasto', 'Servicios básicos (luz, agua, internet)'),
('Inventario', 'gasto', 'Compra de productos'),
('Nómina', 'gasto', 'Pago de sueldos'),
('Marketing', 'gasto', 'Publicidad y promoción'),
('Mantenimiento', 'gasto', 'Mantenimiento de local y equipo');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Productos con bajo stock
CREATE VIEW productos_bajo_stock AS
SELECT 
    id,
    name,
    category,
    stock_count,
    price,
    in_stock
FROM productos
WHERE stock_count > 0 AND stock_count < 10
ORDER BY stock_count ASC;

-- Vista: Productos sin stock
CREATE VIEW productos_sin_stock AS
SELECT 
    id,
    name,
    category,
    price,
    stock_count
FROM productos
WHERE stock_count = 0 OR in_stock = false
ORDER BY name;

-- Vista: Resumen de órdenes
CREATE VIEW resumen_ordenes AS
SELECT 
    status,
    COUNT(*) as cantidad,
    SUM(total) as total_ventas,
    AVG(total) as promedio_venta
FROM ordenes
GROUP BY status;

-- Vista: Productos más vendidos
CREATE VIEW productos_mas_vendidos AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    COUNT(oi.id) as veces_vendido,
    SUM(oi.quantity) as cantidad_total_vendida,
    SUM(oi.subtotal) as ingreso_total
FROM productos p
LEFT JOIN orden_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.category, p.price
HAVING veces_vendido > 0
ORDER BY cantidad_total_vendida DESC;

-- Vista: Gastos mensuales por categoría
CREATE VIEW gastos_mensuales AS
SELECT 
    DATE_FORMAT(date, '%Y-%m') as mes,
    category,
    COUNT(*) as cantidad_gastos,
    SUM(amount) as total_gastos
FROM gastos
GROUP BY DATE_FORMAT(date, '%Y-%m'), category
ORDER BY mes DESC, total_gastos DESC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento: Crear orden completa con items
DELIMITER //
CREATE PROCEDURE crear_orden(
    IN p_phone_number VARCHAR(20),
    IN p_customer_name VARCHAR(255),
    IN p_total DECIMAL(10, 2),
    IN p_shipping_cost DECIMAL(10, 2),
    OUT p_orden_id INT
)
BEGIN
    INSERT INTO ordenes (phone_number, customer_name, total, shipping_cost)
    VALUES (p_phone_number, p_customer_name, p_total, p_shipping_cost);
    
    SET p_orden_id = LAST_INSERT_ID();
END //
DELIMITER ;

-- Procedimiento: Actualizar stock de producto
DELIMITER //
CREATE PROCEDURE actualizar_stock(
    IN p_product_id INT,
    IN p_quantity INT,
    IN p_type ENUM('in', 'out'),
    IN p_reason VARCHAR(255),
    IN p_user_id INT
)
BEGIN
    DECLARE current_stock INT;
    
    -- Obtener stock actual
    SELECT stock_count INTO current_stock FROM productos WHERE id = p_product_id;
    
    -- Actualizar stock
    IF p_type = 'in' THEN
        UPDATE productos 
        SET stock_count = stock_count + p_quantity,
            in_stock = true
        WHERE id = p_product_id;
    ELSE
        UPDATE productos 
        SET stock_count = stock_count - p_quantity,
            in_stock = CASE WHEN (stock_count - p_quantity) > 0 THEN true ELSE false END
        WHERE id = p_product_id;
    END IF;
    
    -- Registrar movimiento
    INSERT INTO movimientos_inventario (product_id, type, quantity, reason, created_by)
    VALUES (p_product_id, p_type, p_quantity, p_reason, p_user_id);
END //
DELIMITER ;

-- Procedimiento: Obtener estadísticas de ventas
DELIMITER //
CREATE PROCEDURE estadisticas_ventas(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        COUNT(*) as total_ordenes,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as ordenes_completadas,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as ordenes_pendientes,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as ordenes_canceladas,
        SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as ingresos_totales,
        AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END) as ticket_promedio,
        COUNT(DISTINCT phone_number) as clientes_unicos
    FROM ordenes
    WHERE date BETWEEN p_fecha_inicio AND p_fecha_fin;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar stock al crear orden item
DELIMITER //
CREATE TRIGGER after_orden_item_insert
AFTER INSERT ON orden_items
FOR EACH ROW
BEGIN
    UPDATE productos 
    SET stock_count = stock_count - NEW.quantity,
        in_stock = CASE WHEN (stock_count - NEW.quantity) > 0 THEN true ELSE false END
    WHERE id = NEW.product_id;
END //
DELIMITER ;

-- Trigger: Validar stock suficiente antes de crear orden item
DELIMITER //
CREATE TRIGGER before_orden_item_insert
BEFORE INSERT ON orden_items
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    SELECT stock_count INTO current_stock 
    FROM productos 
    WHERE id = NEW.product_id;
    
    IF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para completar la orden';
    END IF;
    
    -- Calcular subtotal automáticamente
    SET NEW.subtotal = NEW.quantity * NEW.price;
END //
DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_productos_categoria_stock ON productos(category, in_stock);
CREATE INDEX idx_ordenes_fecha_status ON ordenes(date, status);
CREATE INDEX idx_gastos_fecha_categoria ON gastos(date, category);

-- ============================================
-- CONSULTAS ÚTILES DE EJEMPLO
-- ============================================

/*
-- Obtener productos con bajo stock
SELECT * FROM productos_bajo_stock;

-- Obtener productos más vendidos
SELECT * FROM productos_mas_vendidos LIMIT 10;

-- Ventas del mes actual
SELECT * FROM ordenes 
WHERE MONTH(date) = MONTH(CURRENT_DATE()) 
AND YEAR(date) = YEAR(CURRENT_DATE());

-- Total de gastos por categoría
SELECT category, SUM(amount) as total 
FROM gastos 
GROUP BY category 
ORDER BY total DESC;

-- Inventario total en valor
SELECT 
    SUM(stock_count * price) as valor_inventario,
    COUNT(*) as total_productos
FROM productos;

-- Órdenes pendientes
SELECT * FROM ordenes 
WHERE status = 'pending' 
ORDER BY date DESC;

-- Clientes frecuentes
SELECT 
    phone_number,
    customer_name,
    COUNT(*) as total_ordenes,
    SUM(total) as total_gastado
FROM ordenes
GROUP BY phone_number, customer_name
HAVING total_ordenes > 1
ORDER BY total_ordenes DESC;
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
