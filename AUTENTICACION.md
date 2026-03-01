# Configuración de Autenticación

## 🔐 Sistema de Login Seguro

El sistema utiliza:
- ✅ Contraseñas encriptadas con **bcrypt**
- ✅ Autenticación JWT
- ✅ Validación contra base de datos MySQL
- ✅ Todos los usuarios registrados son **administradores**

## 🚀 Configuración Inicial

### 1. Crear Base de Datos

Ejecuta el script SQL para crear todas las tablas:

```bash
mysql -u root -p < database_schema.sql
```

O ejecuta el archivo `database_schema.sql` desde tu cliente MySQL preferido.

### 2. Crear Usuario Administrador Inicial

Ejecuta el script de Node.js que crea el usuario admin con contraseña encriptada:

```bash
cd backend
node src/scripts/create-admin.js
```

Esto creará el usuario:
- **Email:** admin@tienda.com
- **Password:** admin123

### 3. Variables de Entorno

Asegúrate de que tu archivo `.env` tenga configurado:

```env
JWT_SECRET=tu_clave_secreta_cambiar_en_produccion
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_gestion
```

## 🔑 Credenciales por Defecto

```
Email: admin@tienda.com
Password: admin123
```

**⚠️ IMPORTANTE:** Cambia esta contraseña después del primer login en producción.

## 📝 Notas de Seguridad

1. **Contraseñas Encriptadas**: Todas las contraseñas se guardan con hash bcrypt (salt rounds: 10)
2. **JWT Token**: Los tokens expiran después de 7 días por defecto
3. **Email Único**: No se pueden registrar usuarios con el mismo email
4. **Rol Administrador**: Todos los usuarios registrados tienen rol 'admin' por defecto

## 🔄 Cambiar Contraseña del Admin

Si necesitas resetear la contraseña del administrador, simplemente ejecuta de nuevo:

```bash
node src/scripts/create-admin.js
```

El script actualizará automáticamente la contraseña a `admin123`.

## 📚 Endpoints de Autenticación

### POST /api/auth/register
Registrar nuevo usuario administrador
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

### POST /api/auth/login
Iniciar sesión
```json
{
  "email": "admin@tienda.com",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@tienda.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

## 🛠️ Solución de Problemas

### Error: "El usuario ya existe"
El email ya está registrado. Usa otro email o resetea la contraseña.

### Error de conexión a base de datos
Verifica que:
1. MySQL esté corriendo
2. Las credenciales en `.env` sean correctas
3. La base de datos `sistema_gestion` exista

### Token inválido
El token JWT puede haber expirado. Vuelve a hacer login para obtener un nuevo token.
