-- Insertar categorías de productos
-- Si ya existen, no se vuelven a insertar gracias a INSERT IGNORE

INSERT IGNORE INTO categorias (name, type, description) VALUES
('AURICULARES', 'producto', 'Auriculares y audífonos de todas las gamas'),
('BOCINAS', 'producto', 'Bocinas y altavoces bluetooth y con cable'),
('SMARTWATCH', 'producto', 'Relojes inteligentes y accesorios'),
('CARGADORES', 'producto', 'Cargadores rápidos, cables y adaptadores'),
('ALMACENAMIENTO', 'producto', 'Memorias USB, tarjetas SD y discos externos'),
('ACCESORIOS', 'producto', 'Accesorios diversos para dispositivos electrónicos');

-- Categorías de gastos
INSERT IGNORE INTO categorias (name, type, description) VALUES
('Renta', 'gasto', 'Pago de renta del local'),
('Servicios', 'gasto', 'Luz, agua, internet, etc.'),
('Inventario', 'gasto', 'Compra de productos para reventa'),
('Personal', 'gasto', 'Salarios y pagos a empleados'),
('Marketing', 'gasto', 'Publicidad y promoción'),
('Mantenimiento', 'gasto', 'Reparaciones y mantenimiento del local'),
('Otros', 'gasto', 'Gastos varios no categorizados');
