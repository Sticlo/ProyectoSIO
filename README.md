# Sistema de Gestión - Proyecto Completo

Proyecto full-stack para gestión de productos, órdenes, inventario y finanzas.

## 📁 Estructura del Proyecto

```
proyectosio/
├── ProyectoSIO/          # Frontend - Angular 18
├── Backend/              # Backend - Node.js + Express
└── database_schema.sql   # Schema de base de datos MySQL
```

## 🚀 Componentes

### Frontend (ProyectoSIO)
- **Framework:** Angular 18
- **Características:**
  - Gestión de productos
  - Sistema de órdenes vía WhatsApp
  - Dashboard administrativo
  - Sistema de autenticación
  - Gestión de inventario
  - Panel financiero

**Ejecutar:**
```bash
cd ProyectoSIO
npm install
ng serve
```
Abre http://localhost:4200

### Backend (Backend)
- **Framework:** Node.js + Express
- **Características:**
  - API RESTful completa
  - Autenticación con JWT
  - CRUD de productos, órdenes, gastos
  - Control de inventario
  - Estadísticas y reportes

**Ejecutar:**
```bash
cd Backend
npm install
npm run dev
```
API disponible en http://localhost:3000

**Usuario por defecto:**
- Email: admin@tienda.com
- Password: admin123

### Base de Datos
- **Motor:** MySQL 8.0+
- **Archivo:** `database_schema.sql`

**Configurar:**
1. Abrir MySQL Workbench
2. Ejecutar el script `database_schema.sql`
3. Se creará la base de datos `sistema_gestion` con todas las tablas

## 🔧 Configuración

### Backend
Crear archivo `.env` en la carpeta Backend:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

### Frontend
Las configuraciones están en `ProyectoSIO/src/environments/`

## 📚 Documentación

- **Frontend:** Ver `ProyectoSIO/README.md`
- **Backend:** Ver `Backend/README.md`
- **Base de Datos:** Comentarios en `database_schema.sql`

## 🛠️ Tecnologías

**Frontend:**
- Angular 18
- TypeScript
- SCSS
- Signals API

**Backend:**
- Node.js
- Express
- JWT
- bcryptjs

**Base de Datos:**
- MySQL
- Procedures y Triggers
- Vistas optimizadas

## 📝 Endpoints API

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`

### Productos
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Órdenes
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

### Inventario
- `GET /api/inventory/summary`
- `GET /api/inventory/low-stock`
- `POST /api/inventory/adjust`

### Gastos
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/totals/category`

Ver documentación completa en `Backend/README.md`

## 🚦 Primeros Pasos

1. **Configurar Base de Datos:**
   ```bash
   # En MySQL Workbench, ejecutar database_schema.sql
   ```

2. **Instalar Backend:**
   ```bash
   cd Backend
   npm install
   npm run dev
   ```

3. **Instalar Frontend:**
   ```bash
   cd ProyectoSIO
   npm install
   ng serve
   ```

4. **Abrir aplicación:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## 📄 Licencia

ISC

## 👥 Equipo

Proyecto desarrollado para sistema de gestión empresarial.
