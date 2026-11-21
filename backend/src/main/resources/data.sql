-- ===================================================
-- DATOS INICIALES DEMO PARA PERFORMANCE SKATESHOP
-- ===================================================
-- No se especifican IDs: los genera la columna IDENTITY. Insertar IDs
-- explícitos no avanza la secuencia y cualquier alta posterior choca con
-- la PK 1.

-- 1. Categorías (reciben id 1, 2 y 3 en este orden)
INSERT INTO categorias (nombre, descripcion) VALUES
('Tablas', 'Decks de maple canadiense de 7 y 8 capas profesionales'),
('Accesorios', 'Lijas, rodamientos, pernos y herramientas para skate'),
('Poleras y Polerones', 'Ropa urbana y streetwear para skaters');

-- 2. Productos (categoria_id referencia las filas anteriores)
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, imagen, oferta, categoria_id) VALUES
('tabla-maple-pro-825', 'Tabla Maple Pro 8.25', 'Tabla profesional de 7 capas de maple canadiense', 45000, 3, '/img/productos/tabla-maple-pro-825.jpg', false, 1),
('tabla-performance-81', 'Tabla Performance 8.1', 'Edición limitada team Performance con lija gratis', 34990, 3, '/img/productos/tabla-performance-81.jpg', false, 1),
('lija-premium-black', 'Lija Premium Black', 'Agarre extra y microperforada anti-burbujas', 8900, 11, '/img/productos/lija-premium-black.jpg', true, 2),
('polera-oversize-street', 'Polera Oversize "Street"', 'Algodón 100% pesado con estampado en serigrafía', 22000, 2, '/img/productos/polera-oversize-street.jpg', false, 3);

-- 3. Usuarios con los roles solicitados
-- Las passwords están hasheadas con BCrypt (coste 10). Credenciales de demo:
--   admin@performance.cl    / admin123
--   vendedor@performance.cl / vendedor123
--   cliente@correo.cl       / cliente123
INSERT INTO usuarios (run, nombre, apellidos, email, password, rol, region, comuna, direccion) VALUES
('11111111-1', 'Administrador', 'Principal', 'admin@performance.cl', '$2a$10$PLIpuOg.FH1ntb1gZ33Sru0ZTA4/r93z8b6fG/l5w74jbLhUOr3bu', 'ADMINISTRADOR', 'Región Metropolitana de Santiago', 'Santiago', 'Av. Skate 123'),
('22222222-2', 'Vendedor', 'Tienda', 'vendedor@performance.cl', '$2a$10$83vErpjnrKgGou04hPTw6O8brwqlGSoHuZDEONobqb0q/yQMkYzuK', 'VENDEDOR', 'Región Metropolitana de Santiago', 'Providencia', 'Av. Providencia 456'),
('33333333-3', 'Cliente', 'Frecuente', 'cliente@correo.cl', '$2a$10$2ll7eiA8zbxoztJDY9opgeblSF1/c/L0JdEGlJ5NrQUlkiup0pkFm', 'CLIENTE', 'Región Metropolitana de Santiago', 'Ñuñoa', 'Calle Los Alerces 789');
