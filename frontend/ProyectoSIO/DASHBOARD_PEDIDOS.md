# Dashboard de Pedidos WhatsApp

## Descripción
Panel lateral completo para gestionar los pedidos recibidos por WhatsApp desde la tienda. Permite llevar estadísticas, ver historial de pedidos, actualizar estados y eliminar clientes que no completaron la compra.

## Características

### 📊 Estadísticas en Tiempo Real
El dashboard muestra 6 métricas clave:

1. **Total Pedidos**: Cantidad total de pedidos recibidos
2. **Pendientes**: Pedidos que aún no han sido procesados
3. **Completados**: Pedidos entregados exitosamente
4. **Ingresos**: Suma total de pedidos completados
5. **Clientes**: Cantidad de números de WhatsApp únicos
6. **Ticket Promedio**: Valor promedio de cada pedido completado

### 🎯 Sistema de Notificaciones
- **Badge en el botón**: Muestra la cantidad de órdenes no leídas
- **Dot indicator**: Punto azul animado en pedidos nuevos
- **Resaltado visual**: Fondo especial para pedidos no leídos

### 🔍 Búsqueda y Filtros
- **Búsqueda global**: Por ID de pedido, número de teléfono, nombre de cliente o productos
- **Filtros rápidos**: 
  - Todos los pedidos
  - Solo pendientes
  - Solo completados

### 📱 Gestión de Pedidos

#### Estados de Pedido
Los pedidos pueden tener 4 estados diferentes:
- 🟡 **Pendiente** (warning): Recién recibido, esperando confirmación
- 🔵 **Confirmado** (info): Cliente confirmó el pedido, listo para procesar
- 🟢 **Completado** (success): Pedido entregado exitosamente
- 🔴 **Cancelado** (danger): Venta no se concretó

#### Actualizar Estado
1. Haz clic en cualquier pedido de la lista
2. Se abre el modal de detalle
3. Selecciona el estado deseado
4. El cambio se guarda automáticamente

### 🗑️ Eliminación de Datos

#### Eliminar un Pedido Individual
Útil cuando un pedido específico no se concretó:
1. Abre el detalle del pedido
2. Clic en "Eliminar Pedido"
3. Confirma la acción
4. El pedido se elimina permanentemente

#### Eliminar un Número Completo
Para clientes que hicieron múltiples pedidos pero ninguno se concretó:
1. Abre cualquier pedido del cliente
2. Clic en "Eliminar Número"
3. Se eliminarán **TODAS** las órdenes asociadas a ese número
4. Útil para limpiar la base de datos

### 📦 Detalle del Pedido

Cada pedido muestra:
- **ID único**: Identificador del pedido (formato: `ORD-timestamp-random`)
- **Fecha y hora**: Cuándo se realizó el pedido
- **Número de WhatsApp**: Con ícono de WhatsApp clicable
- **Estado actual**: Con selector visual para cambiar
- **Lista de productos**: 
  - Nombre del producto
  - Categoría
  - Cantidad
  - Precio unitario
  - Subtotal
- **Costos**:
  - Subtotal de productos
  - Costo de envío (si aplica)
  - Total final

### 🎨 Diseño Apple Glassmorphism

El dashboard utiliza el mismo lenguaje visual del resto de la aplicación:
- **Glassmorphism**: Fondos translúcidos con blur
- **Animaciones suaves**: Transiciones cubic-bezier
- **Gradientes**: Para iconos y estados
- **Colores Apple**: 
  - Primary: #667eea (Púrpura)
  - Success: #10b981 (Verde)
  - Warning: #f59e0b (Naranja)
  - Danger: #ef4444 (Rojo)
  - WhatsApp: #25D366 (Verde WhatsApp)

## Flujo de Trabajo Recomendado

### 1. Cliente Realiza Pedido
- Cliente agrega productos al carrito
- Presiona "Finalizar pedido por WhatsApp"
- Se abre WhatsApp con mensaje pre-formateado
- Cliente completa sus datos y envía

### 2. Registro Automático
- El sistema registra automáticamente el pedido
- Estado inicial: **Pendiente**
- Aparece badge rojo con número de pedidos no leídos
- Push notification visual en el botón "Pedidos WhatsApp"

### 3. Revisión en Admin
- Admin hace clic en "Pedidos WhatsApp"
- Se abre el dashboard lateral
- Visualiza todas las órdenes pendientes
- Hace clic en el pedido para ver detalles

### 4. Procesamiento
- **Cliente confirma por WhatsApp** → Cambiar a "Confirmado"
- **Pedido preparado y enviado** → Mantener en "Confirmado"
- **Cliente recibió el producto** → Cambiar a "Completado"
- **Cliente no respondió/canceló** → Cambiar a "Cancelado"

### 5. Análisis y Limpieza
- Ver estadísticas en tiempo real
- Identificar clientes frecuentes
- Analizar productos más vendidos
- Eliminar pedidos cancelados antiguos
- Eliminar números de clientes que no completan compras

## Almacenamiento de Datos

### LocalStorage
Todos los pedidos se guardan en `localStorage` con la key `whatsapp_orders`:
- ✅ **Persistente**: Se mantiene aunque cierres el navegador
- ✅ **Privado**: Solo visible en el dispositivo del admin
- ✅ **Rápido**: Acceso instantáneo sin servidor
- ⚠️ **Local**: No sincroniza entre dispositivos
- ⚠️ **Límite**: Aproximadamente 5-10 MB de datos

### Estructura de una Orden
```typescript
{
  id: "ORD-1708185600000-ABC123XYZ",
  phoneNumber: "573017453703",
  customerName: "Juan Pérez",
  items: [
    {
      productId: "prod_123",
      name: "AirBuds Pro Max",
      category: "AURICULARES",
      price: 199,
      quantity: 2,
      image: "..."
    }
  ],
  total: 398,
  shippingCost: 0,
  date: "2024-02-16T10:30:00.000Z",
  status: "pending",
  notes: "Entregar en la tarde",
  viewed: false
}
```

## Consejos de Uso

### Para Mejorar las Ventas
1. **Responde rápido**: Revisa el dashboard frecuentemente
2. **Marca como leído**: Para no perder pedidos entre muchos
3. **Actualiza estados**: Mantén al cliente informado del proceso
4. **Usa estadísticas**: Identifica productos populares para stock

### Para Mantener Limpio el Sistema
1. **Limpieza semanal**: Elimina pedidos cancelados antiguos
2. **Elimina números spam**: Clientes que piden pero no compran
3. **Completa pedidos**: Marca como completados para estadísticas reales

### Para Análisis de Negocio
- **Total de ingresos**: Solo cuenta pedidos completados
- **Ticket promedio**: Ayuda a definir envío gratis
- **Clientes únicos**: Analiza qué porcentaje vuelve a comprar
- **Productos top**: Identifica tu catálogo más rentable

## Próximas Mejoras Sugeridas

### Funcionalidades Avanzadas
- [ ] Exportar datos a Excel/CSV
- [ ] Gráficos de ventas por día/semana/mes
- [ ] Notas personalizadas por pedido
- [ ] Historial de comunicaciones con cliente
- [ ] Sistema de seguimiento de envíos
- [ ] Integración con Google Sheets para backup
- [ ] Notificaciones push de nuevos pedidos
- [ ] Modo oscuro

### Notificaciones automatizadas
- [ ] Sonido cuando llega nuevo pedido
- [ ] Notificación de escritorio (Desktop Notification API)
- [ ] Badge en el título del navegador con contador

### Filtros Adicionales
- [ ] Por rango de fechas
- [ ] Por rango de precios
- [ ] Por productos específicos
- [ ] Por estado de pago

## Soporte y Solución de Problemas

### Los pedidos no aparecen
- Verifica que el cliente haya hecho clic en "Finalizar pedido por WhatsApp"
- Revisa la consola del navegador por errores
- Comprueba que localStorage esté habilitado

### El badge no actualiza
- Refresca la página
- Verifica que el OrderService esté inyectado correctamente
- Revisa que las órdenes tengan `viewed: false`

### No puedo eliminar pedidos
- Solo se puede eliminar desde el modal de detalle
- Confirma que tienes permisos de admin
- Verifica que no sea un pedido protegido

### Las estadísticas están incorrectas
- Solo pedidos "completados" cuentan para ingresos
- Los promedios se calculan solo sobre completados
- Refresca la página para recalcular

## Código Relevante

### Servicios
- `src/app/core/services/order.service.ts` - Lógica de órdenes
- `src/app/core/services/whatsapp.service.ts` - Envío y registro
- `src/app/core/services/storage.service.ts` - Persistencia

### Componentes
- `src/app/features/admin/orders-dashboard/` - Dashboard completo
- `src/app/features/admin/admin.ts` - Panel de administración

### Configuración
- `src/app/config/site.config.ts` - Configuración general

---

**Nota Importante**: Este sistema está diseñado para pequeñas y medianas empresas con volumen moderado de pedidos. Para alto volumen, considera implementar un backend con base de datos real.
