# Backend API - Sistema de Gestión

API RESTful para el sistema de gestión de productos, órdenes, inventario y gastos.

## ✨ Nuevo: Chatbot con IA Integrado

El backend incluye un chatbot inteligente con integración a IAs **completamente gratuitas**:
- 🤖 **DeepSeek** (Recomendado) - Sin límites, excelente calidad
- ⚡ **Groq** - Ultra rápido, Llama 3.3 70B
- 🤗 **Hugging Face** - Mixtral 8x7B

Ver [CHATBOT_IA.md](../CHATBOT_IA.md) para configuración completa.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Configuración de origen cruzado
- **dotenv** - Variables de entorno
- **axios** - Cliente HTTP para APIs de IA

## 📁 Estructura del Proyecto

```
Backend/
├── src/
│   ├── controllers/       # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── inventory.controller.js
│   │   ├── expense.controller.js
│   │   └── chat.controller.js      # 🆕 Chatbot IA
│   ├── models/           # Modelos de datos
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   └── expense.model.js
│   ├── routes/           # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── inventory.routes.js
│   │   ├── expense.routes.js
│   │   └── chat.routes.js          # 🆕 Rutas del chatbot
│   ├── middleware/       # Middlewares
│   │   └── auth.middleware.js
│   └── server.js         # Servidor principal
├── .env                  # Variables de entorno
├── .env.example          # 🆕 Plantilla de configuración
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus valores
# Para el chatbot IA, elige un proveedor:
# - DeepSeek (recomendado): https://platform.deepseek.com/
# - Groq (rápido): https://console.groq.com/
# - Hugging Face: https://huggingface.co/settings/tokens
```

3. Iniciar servidor:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

2. Configurar variables de entorno en `.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

3. Iniciar servidor:
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

## 📚 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/profile` | Obtener perfil del usuario | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |

**Ejemplo de Login:**
```json
POST /api/auth/login
{
  "email": "admin@tienda.com",
  "password": "admin123"
}

Response:
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@tienda.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

### Productos (`/api/products`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todos los productos | No |
| GET | `/:id` | Obtener producto por ID | No |
| GET | `/?category=Auriculares` | Filtrar por categoría | No |
| GET | `/?search=laptop` | Buscar productos | No |
| POST | `/` | Crear producto | Admin |
| PUT | `/:id` | Actualizar producto | Admin |
| PATCH | `/:id/stock` | Actualizar stock | Admin |
| DELETE | `/:id` | Eliminar producto | Admin |

**Ejemplo de Crear Producto:**
```json
POST /api/products
Authorization: Bearer {token}
{
  "name": "Laptop Pro",
  "category": "Laptops",
  "description": "Laptop de alto rendimiento",
  "price": 1299,
  "stockCount": 15,
  "inStock": true,
  "image": "/assets/laptop.png"
}
```

### Órdenes (`/api/orders`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todas las órdenes | Sí |
| GET | `/:id` | Obtener orden por ID | Sí |
| GET | `/stats` | Estadísticas de órdenes | Sí |
| GET | `/?status=pending` | Filtrar por estado | Sí |
| POST | `/` | Crear nueva orden | Sí |
| PUT | `/:id` | Actualizar orden | Admin |
| PATCH | `/:id/status` | Actualizar estado | Admin |
| PATCH | `/:id/viewed` | Marcar como vista | Admin |
| DELETE | `/:id` | Eliminar orden | Admin |

**Ejemplo de Crear Orden:**
```json
POST /api/orders
Authorization: Bearer {token}
{
  "phoneNumber": "+5215512345678",
  "customerName": "Juan Pérez",
  "items": [
    {
      "productId": "1",
      "name": "AirBuds Pro Max",
      "quantity": 2,
      "price": 199
    }
  ],
  "total": 398,
  "shippingCost": 50,
  "notes": "Entregar por la tarde"
}
```

### Inventario (`/api/inventory`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/summary` | Resumen de inventario | Admin |
| GET | `/low-stock` | Productos con bajo stock | Admin |
| GET | `/out-of-stock` | Productos sin stock | Admin |
| POST | `/adjust` | Ajustar inventario | Admin |

**Ejemplo de Ajustar Inventario:**
```json
POST /api/inventory/adjust
Authorization: Bearer {token}
{
  "productId": "1",
  "quantity": 10,
  "type": "in",
  "reason": "Nueva compra"
}
```

### Gastos (`/api/expenses`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todos los gastos | Admin |
| GET | `/:id` | Obtener gasto por ID | Admin |
| GET | `/totals/category` | Totales por categoría | Admin |
| GET | `/totals/period` | Total por período | Admin |
| POST | `/` | Crear gasto | Admin |
| PUT | `/:id` | Actualizar gasto | Admin |
| DELETE | `/:id` | Eliminar gasto | Admin |

**Ejemplo de Crear Gasto:**
```json
POST /api/expenses
Authorization: Bearer {token}
{
  "description": "Pago de renta",
  "amount": 5000,
  "category": "Renta",
  "date": "2026-02-01"
}
```

### Chatbot IA (`/api/chat`) 🆕

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/` | Enviar mensaje al chatbot | Admin |

**Características:**
- 🤖 Integración con IAs gratuitas (DeepSeek, Groq, Hugging Face)
- ⚡ Respuestas inteligentes sobre el sistema
- 🔒 Solo accesible para administradores
- 💬 No requiere base de datos

**Ejemplo de uso:**
```json
POST /api/chat
Authorization: Bearer {token}
{
  "message": "¿Cómo agrego un nuevo producto?"
}

// Respuesta:
{
  "message": "Para agregar un producto, ve al panel de administración...",
  "timestamp": "2026-02-23T15:30:00.000Z"
}
```

**Ver configuración completa en:** [CHATBOT_IA.md](../CHATBOT_IA.md)

## 🔐 Autenticación

El API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos:

1. Obtener token mediante login
2. Incluir token en el header:
```
Authorization: Bearer {tu_token_aqui}
```

### Roles de Usuario

- **user**: Usuario regular (puede crear órdenes)
- **admin**: Administrador (acceso completo)

## 🛠️ Base de Datos

Actualmente el backend utiliza almacenamiento en memoria (arrays de JavaScript). Los datos se pierden al reiniciar el servidor.

Para persistencia de datos, se puede integrar:
- MongoDB
- PostgreSQL
- MySQL
- SQLite

## 🔧 Usuario por Defecto

El sistema incluye un usuario administrador por defecto:

```
Email: admin@tienda.com
Password: admin123
Role: admin
```

## 📝 Estados de Órdenes

- `pending` - Pendiente
- `confirmed` - Confirmada
- `cancelled` - Cancelada
- `completed` - Completada
- `no-response` - Sin respuesta

## 🚦 Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto
- `500` - Error del servidor

## 🌐 CORS

El servidor está configurado para aceptar peticiones desde:
- `http://localhost:4200` (Angular frontend por defecto)

Para permitir otros orígenes, modificar `CORS_ORIGIN` en `.env`.

## 📊 Ejemplo de Respuestas

### Éxito
```json
{
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error
```json
{
  "error": "Mensaje de error descriptivo"
}
```

## 🔄 Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

# Ejecutar tests (por implementar)
npm test
```

## 📦 Próximas Mejoras

- [ ] Integración con base de datos real
- [ ] Tests unitarios y de integración
- [ ] Paginación de resultados
- [ ] Rate limiting
- [ ] Logs avanzados
- [ ] Caché con Redis
- [ ] Subida de imágenes
- [ ] Conexión con WhatsApp API
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Generación de reportes PDF

## 📄 Licencia

ISC

## 👨‍💻 Soporte

Para problemas o sugerencias, contactar al equipo de desarrollo.
