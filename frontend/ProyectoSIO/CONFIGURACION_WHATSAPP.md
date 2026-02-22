# Configuración de WhatsApp y Pedidos

## Descripción
Este sistema permite recibir pedidos directamente por WhatsApp sin necesidad de configurar pasarelas de pago o sistemas de checkout complejos. Cuando el cliente presiona "Finalizar pedido por WhatsApp", se abre WhatsApp con un mensaje pre-formateado que contiene todos los detalles del pedido.

## Configuración

Toda la configuración se encuentra en el archivo `src/app/config/site.config.ts`:

### 1. Número de WhatsApp

```typescript
contact: {
  whatsapp: '573017453703',  // Formato: código de país + número (sin símbolos +, -, espacios)
  phone: '+57 301 745 3703',
  email: 'contacto@tutienda.com',
  // ...
}
```

**Importante**: El formato del número debe ser:
- Sin el símbolo `+`
- Sin guiones `-`
- Sin espacios
- Código de país + número
- Ejemplo: `573017453703` (Colombia: 57 + 3017453703)

### 2. Configuración de Pedidos

```typescript
orders: {
  // Habilitar o deshabilitar checkout por WhatsApp
  enableWhatsAppCheckout: true,
  
  // Texto del botón de checkout (puedes personalizarlo)
  checkoutButtonText: 'Finalizar pedido por WhatsApp',
  
  // Configuración de envío
  shipping: {
    isFree: true,                    // Si el envío es gratis
    cost: 0,                         // Costo del envío (si no es gratis)
    freeShippingThreshold: 100000    // Envío gratis en compras mayores a este monto
  },
  
  // Limpiar el carrito después de enviar el pedido
  clearCartAfterCheckout: false
}
```

## Personalización

### Envío Gratis Siempre
```typescript
shipping: {
  isFree: true,
  cost: 0,
  freeShippingThreshold: 0
}
```

### Envío Gratis Por Monto Mínimo
```typescript
shipping: {
  isFree: false,
  cost: 10000,                    // $10,000 de envío
  freeShippingThreshold: 100000   // Gratis si compra más de $100,000
}
```

### Envío con Costo Fijo
```typescript
shipping: {
  isFree: false,
  cost: 15000,                    // Siempre cuesta $15,000
  freeShippingThreshold: 999999999 // Nunca será gratis
}
```

### Limpiar Carrito Automáticamente
```typescript
clearCartAfterCheckout: true  // El carrito se limpia 1 segundo después de enviar
```

### Texto Personalizado del Botón
```typescript
checkoutButtonText: 'Enviar pedido'
checkoutButtonText: '¡Ordenar ahora!'
checkoutButtonText: 'Solicitar cotización'
```

## Flujo de Pedido

1. **Cliente agrega productos** al carrito
2. **Cliente hace clic** en el botón de checkout (con ícono de WhatsApp)
3. **Se abre WhatsApp** (web o app) con un mensaje pre-formateado
4. **El mensaje incluye**:
   - Fecha del pedido
   - Lista de productos con cantidades y precios
   - Total del pedido
   - Campos para que el cliente complete:
     - Nombre completo
     - Dirección de entrega
     - Teléfono de contacto
     - Observaciones adicionales
5. **Cliente completa** sus datos y envía el mensaje
6. **Tú recibes** el pedido completo por WhatsApp

## Formato del Mensaje

El mensaje enviado tiene este formato:

```
🛍️ NUEVO PEDIDO

📅 Fecha: [fecha y hora actual]

📦 PRODUCTOS:
━━━━━━━━━━━━━━━
• Nombre del Producto
  Categoría | Cantidad: X | Precio unitario: $X,XXX
  Subtotal: $X,XXX

• Otro Producto
  Categoría | Cantidad: X | Precio unitario: $X,XXX
  Subtotal: $X,XXX

━━━━━━━━━━━━━━━
💰 TOTAL A PAGAR: $X,XXX

━━━━━━━━━━━━━━━
📍 Por favor, proporciona tus datos para el envío:

👤 Nombre completo:
📍 Dirección de entrega:
📱 Teléfono de contacto:
📝 Observaciones adicionales (opcional):

🙌 ¡Gracias por tu compra!
```

## Ventajas de Este Sistema

✅ **Sin costos de pasarelas de pago** (Stripe, PayPal, etc.)
✅ **Comunicación directa** con el cliente
✅ **Flexibilidad en pagos** (puedes aceptar transferencias, efectivo, etc.)
✅ **Fácil seguimiento** del pedido vía WhatsApp
✅ **Confirmación inmediata** con el cliente
✅ **No requiere integraciones complejas**

## Casos de Uso

Este sistema es ideal para:
- 🏪 Tiendas locales pequeñas
- 🎨 Emprendimientos y negocios artesanales
- 🍕 Restaurantes y servicios de comida
- 📦 Negocios que prefieren coordinar entregas manualmente
- 💼 Servicios de cotización personalizada
- 🌐 Mercados en países donde WhatsApp es el principal medio de comunicación

## Soporte Técnico

Si necesitas ayuda para configurar el sistema, revisa los siguientes archivos:
- `src/app/config/site.config.ts` - Configuración principal
- `src/app/core/services/whatsapp.service.ts` - Lógica de envío
- `src/app/shared/components/cart-sidebar/` - Componente del carrito
