# Guía Completa del Chatbot Inteligente con IA

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Características Principales](#características-principales)
4. [Implementación Detallada](#implementación-detallada)
5. [System Prompt Optimizado](#system-prompt-optimizado)
6. [Detección de Intenciones](#detección-de-intenciones)
7. [Contexto de Conversación](#contexto-de-conversación)
8. [Consultas a Base de Datos](#consultas-a-base-de-datos)
9. [Seguridad y Buenas Prácticas](#seguridad-y-buenas-prácticas)
10. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Resumen Ejecutivo

Este chatbot está diseñado como **asistente virtual oficial** de un ecommerce de tecnología. A diferencia de un chatbot administrativo, este está orientado al **servicio al cliente**, proporcionando información sobre el sitio web, productos y ayudando en el proceso de compra.

### Tecnologías Utilizadas

- **Frontend**: Angular 19+ con Signals
- **Backend**: Node.js + Express
- **IA**: DeepSeek / Groq / Hugging Face (APIs gratuitas)
- **Base de Datos**: Sistema de productos en memoria (fácilmente adaptable a SQL/NoSQL)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
│                    (Navegador Web)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                            │
│                                                                  │
│  ┌─────────────────┐      ┌──────────────────┐                │
│  │ ChatbotComponent│◄────►│  ChatService     │                │
│  └─────────────────┘      └──────────────────┘                │
│           │                        │                            │
│           │                        │ HTTP + Auth Token          │
│           └────────────────────────┼───────────────────────────►│
└─────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                             │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ Auth Middleware  │ (Verifica token)                         │
│  └────────┬─────────┘                                           │
│           ▼                                                      │
│  ┌──────────────────┐      ┌────────────────────┐              │
│  │ ChatController   │◄────►│ ProductModel       │              │
│  │                  │      │ (Base de Datos)    │              │
│  │ • detectIntent() │      └────────────────────┘              │
│  │ • getContext()   │                                           │
│  │ • callAI()       │                                           │
│  └────────┬─────────┘                                           │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API de IA (DeepSeek/Groq)                    │
│                                                                  │
│  • Recibe: Array de mensajes (system, user, assistant)         │
│  • Procesa: Con contexto de conversación                        │
│  • Devuelve: Respuesta inteligente en español                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Características Principales

### ✅ 1. Asistente Orientado al Cliente

- **NO** da instrucciones administrativas
- Explica funciones del sitio desde la perspectiva del usuario
- Guía en el proceso de compra
- Responde preguntas sobre productos y servicios

### ✅ 2. Mantiene Contexto de Conversación

```javascript
// El sistema recuerda conversaciones pasadas
Usuario: "¿Tienen auriculares?"
Bot: "¡Sí! Tenemos una gran variedad de auriculares..."

Usuario: "¿Cuánto cuestan?" // (El bot sabe que te refieres a auriculares)
Bot: "Los auriculares que tenemos disponibles van desde..."
```

### ✅ 3. Detección Inteligente de Intenciones

El sistema detecta automáticamente qué quiere el usuario:
- **Consulta de inventario**: "¿cuántos auriculares hay?"
- **Consulta de producto**: "¿cuánto cuestan las bocinas?"
- **Navegación**: "¿para qué sirve la sección contacto?"
- **Ayuda general**: información sobre el sitio

### ✅ 4. Consultas Reales a Base de Datos

Cuando el usuario pregunta por inventario, el sistema:
1. Detecta la intención
2. Consulta la base de datos real
3. Proporciona información actualizada
4. La IA genera una respuesta natural con esos datos

---

## Implementación Detallada

### Backend: chat.controller.js

#### Estructura Principal

```javascript
const axios = require('axios');
const ProductModel = require('../models/product.model');

// Almacenamiento temporal de contextos
const conversationContexts = new Map();
const CONTEXT_EXPIRY = 30 * 60 * 1000; // 30 minutos

class ChatController {
  // Método principal
  static async sendMessage(req, res) { ... }
  
  // Detección de intenciones
  static async detectIntent(message) { ... }
  
  // Consulta a base de datos
  static async getProductData(productName, category) { ... }
  
  // Llamada a IA con contexto
  static async getAIResponse(userMessage, conversationId, additionalContext) { ... }
  
  // System prompt optimizado
  static getSystemPrompt() { ... }
  
  // Gestión de contexto
  static getOrCreateContext(conversationId) { ... }
  static cleanOldContexts() { ... }
}
```

#### Flujo de Procesamiento

```javascript
1. Usuario envía mensaje → Backend recibe
                           ↓
2. Detectar intención → ¿Necesita datos de BD?
                       ↓                    ↓
                      Sí                   No
                       ↓                    ↓
3. Consultar BD →  Agregar datos         Continuar
                       ↓                    ↓
4. Obtener/Crear contexto de conversación
                       ↓
5. Construir array de messages:
   [
     { role: 'system', content: systemPrompt + datos },
     ...historial_previo...,
     { role: 'user', content: mensaje_actual }
   ]
                       ↓
6. Llamar a API de IA → DeepSeek/Groq
                       ↓
7. Guardar respuesta en contexto
                       ↓
8. Devolver respuesta al usuario
```

---

## System Prompt Optimizado

### Características del System Prompt

El system prompt es **crucial** para el comportamiento del chatbot. Nuestro prompt incluye:

1. **Identidad clara**: "Eres el asistente virtual oficial de una tienda online"
2. **Rol específico**: Atención al cliente, NO administrador
3. **Conocimiento del sitio**: Todas las secciones y sus funciones
4. **Comportamiento esperado**: Guías claras sobre cómo responder
5. **Restricciones**: Qué NO debe hacer
6. **Tono y estilo**: Amigable, profesional, en español

### Ejemplo Completo

```javascript
static getSystemPrompt() {
  return `Eres el asistente virtual oficial de una tienda online de tecnología.

**INFORMACIÓN DEL SITIO WEB:**

**Secciones disponibles:**
- **Inicio**: Página principal con productos destacados y ofertas
- **Productos**: Catálogo completo con filtros
- **Categorías**: Organización por tipo (Auriculares, Bocinas, etc.)
- **Contacto**: Formulario para consultas
- **Carrito**: Gestión de compras
- **Pedidos**: Seguimiento de envíos

**TU COMPORTAMIENTO:**

1. **Cuando pregunten por secciones**: Explica su función para el CLIENTE
2. **Consultas de inventario**: Usa datos reales si están disponibles
3. **Navegación**: Guía paso a paso
4. **Tono**: Amigable y profesional en español

**LO QUE NO DEBES HACER:**
❌ No menciones "panel de administración"
❌ No des instrucciones administrativas
❌ No inventes información

Mantén contexto de la conversación.`;
}
```

---

## Detección de Intenciones

### Implementación

```javascript
static async detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Intención: Consulta de inventario/stock
  if (lowerMessage.match(/cuántos|cantidad|stock|inventario|disponible/)) {
    const products = ['auriculares', 'bocinas', 'smartwatch'];
    const mentionedProduct = products.find(p => lowerMessage.includes(p));
    
    return {
      type: 'inventory_query',
      product: mentionedProduct
    };
  }
  
  // Intención: Consulta de producto
  if (lowerMessage.match(/precio|costo|características/)) {
    return { type: 'product_query' };
  }
  
  // Intención: Navegación
  if (lowerMessage.match(/sección|página|donde|cómo/)) {
    return { type: 'navigation' };
  }
  
  return { type: 'general' };
}
```

### Uso en el Flujo

```javascript
// En sendMessage()
const intent = await ChatController.detectIntent(message);
let additionalContext = '';

if (intent.type === 'inventory_query') {
  // Consultar base de datos
  additionalContext = await ChatController.getProductData(intent.product);
}

// Pasar contexto adicional a la IA
const aiResponse = await ChatController.getAIResponse(
  message, 
  conversationId, 
  additionalContext  // ← Datos reales de la BD
);
```

---

## Contexto de Conversación

### ¿Por qué es importante?

El contexto permite al chatbot "recordar" conversaciones previas:

```javascript
Usuario: "¿Tienen auriculares con cancelación de ruido?"
Bot: "Sí, tenemos el AirBuds Pro Max..."

Usuario: "¿Cuál es su precio?"  // ← El bot sabe que hablas de AirBuds Pro Max
Bot: "El AirBuds Pro Max tiene un precio de $199..."
```

### Implementación

```javascript
// Estructura de contexto
const context = {
  messages: [
    { role: 'user', content: 'mensaje1' },
    { role: 'assistant', content: 'respuesta1' },
    { role: 'user', content: 'mensaje2' },
    { role: 'assistant', content: 'respuesta2' }
  ],
  createdAt: Date.now(),
  lastActivity: Date.now()
};

// Gestión de contexto
static getOrCreateContext(conversationId) {
  if (!conversationContexts.has(conversationId)) {
    conversationContexts.set(conversationId, {
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    });
  }
  return conversationContexts.get(conversationId);
}

// Limpieza automática (evitar memoria infinita)
static cleanOldContexts() {
  const now = Date.now();
  for (const [id, context] of conversationContexts.entries()) {
    if (now - context.lastActivity > CONTEXT_EXPIRY) {
      conversationContexts.delete(id);
    }
  }
}
```

### Array de Messages para la IA

```javascript
const messages = [
  { 
    role: 'system', 
    content: systemPrompt + additionalContext  // ← Instrucciones + datos BD
  },
  ...context.messages,  // ← Historial de conversación
  { 
    role: 'user', 
    content: userMessage  // ← Mensaje actual
  }
];

// Enviar a DeepSeek/Groq
const response = await callDeepSeek(apiKey, messages);
```

---

## Consultas a Base de Datos

### Flujo Completo

```javascript
// 1. Usuario pregunta
"¿Cuántos auriculares tienen disponibles?"

// 2. Sistema detecta intención
{ type: 'inventory_query', product: 'auriculares' }

// 3. Consulta a base de datos
static async getProductData(productName) {
  const products = ProductModel.search(productName);
  
  let contextInfo = '\n\n[DATOS REALES DE INVENTARIO]:\n';
  products.forEach(p => {
    contextInfo += `- ${p.name}: ${p.stock Count} unidades, $${p.price}\n`;
  });
  
  return contextInfo;
}

// 4. Resultado
`
[DATOS REALES DE INVENTARIO]:
- AirBuds Pro Max: 25 unidades, $199
- SoundWave Earbuds: 18 unidades, $149
`

// 5. Este contexto se agrega al system prompt
// 6. La IA genera respuesta natural:
"Tenemos dos modelos de auriculares disponibles:
- AirBuds Pro Max: 25 unidades en stock por $199
- SoundWave Earbuds: 18 unidades en stock por $149
¿Cuál te gustaría conocer más?"
```

### Adaptación a Tu Base de Datos

```javascript
// Ejemplo con MySQL
static async getProductData(productName) {
  const connection = await mysql.createConnection(dbConfig);
  
  const [rows] = await connection.execute(
    'SELECT name, stock_count, price FROM products WHERE name LIKE ?',
    [`%${productName}%`]
  );
  
  let contextInfo = '\n\n[DATOS REALES DE INVENTARIO]:\n';
  rows.forEach(p => {
    contextInfo += `- ${p.name}: ${p.stock_count} unidades, $${p.price}\n`;
  });
  
  await connection.end();
  return contextInfo;
}
```

---

## Seguridad y Buenas Prácticas

### 1. Protección de API Key

✅ **CORRECTO**: En variables de entorno
```javascript
// .env
AI_API_KEY=sk-d55dc18550764a70ba0ddbd194c8e4c6

// En código
const apiKey = process.env.AI_API_KEY;
```

❌ **INCORRECTO**: Hardcodeada
```javascript
const apiKey = "sk-d55dc18550764a70ba0ddbd194c8e4c6"; // ¡NUNCA!
```

### 2. Validación de Entrada

```javascript
// Validar mensaje
if (!message || !message.trim()) {
  return res.status(400).json({ error: 'El mensaje es requerido' });
}

// Limitar longitud
if (message.length > 1000) {
  return res.status(400).json({ error: 'Mensaje demasiado largo' });
}
```

### 3. Autenticación

```javascript
// Middleware de autenticación
const { authenticateToken } = require('../middleware/auth.middleware');

// Aplicar a rutas
router.post('/', authenticateToken, ChatController.sendMessage);
```

### 4. Rate Limiting (Recomendado)

```javascript
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 mensajes por minuto
  message: 'Demasiadas peticiones, por favor intenta más tarde'
});

router.post('/', authenticateToken, chatLimiter, ChatController.sendMessage);
```

### 5. Sanitización de Respuestas

```javascript
// Evitar inyección de código en respuestas
const sanitizeResponse = (response) => {
  return response
    .replace(/<script>/gi, '')
    .replace(/<\/script>/gi, '')
    .trim();
};
```

### 6. Gestión de Errores

```javascript
try {
  const aiResponse = await ChatController.getAIResponse(...);
  res.json({ message: aiResponse });
} catch (error) {
  console.error('Error:', error);
  
  // No exponer detalles internos
  res.status(500).json({
    error: 'Error al procesar el mensaje',
    message: 'Lo siento, intenta nuevamente'
  });
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Consulta Sobre Sección

**Usuario**: "¿Para qué sirve la sección de contacto?"

**Sistema**:
1. Detecta intención: `navigation`
2. No necesita BD
3. System prompt + pregunta → IA

**Respuesta**: "La sección de **Contacto** permite a los clientes comunicarse directamente con nosotros mediante un formulario. Pueden enviar consultas sobre productos, reportar problemas o hacer sugerencias..."

### Ejemplo 2: Consulta de Inventario

**Usuario**: "¿Cuántos auriculares tienen disponibles?"

**Sistema**:
1. Detecta intención: `inventory_query`, producto: `auriculares`
2. Consulta BD → Obtiene 2 productos con stock
3. Agrega datos al contexto:
   ```
   [DATOS REALES]:
   - AirBuds Pro Max: 25 unidades, $199
   - SoundWave: 18 unidades, $149
   ```
4. System prompt + datos + pregunta → IA

**Respuesta**: "Actualmente tenemos dos modelos de auriculares en stock:
- **AirBuds Pro Max**: 25 unidades disponibles por $199
- **SoundWave Earbuds**: 18 unidades disponibles por $149

¿Te gustaría conocer más detalles de alguno?"

### Ejemplo 3: Conversación con Contexto

**Usuario**: "¿Tienen smartwatches?"

**Bot**: "¡Sí! Tenemos el ChronoWave Watch, un elegante smartwatch con monitoreo de salud 24/7..."

**Usuario**: "¿Cuánto cuesta?" *(el bot recuerda que hablas de smartwatch)*

**Bot**: "El ChronoWave Watch tiene un precio de $299..."

**Usuario**: "¿Cuántos tienen en stock?"

**Bot**: "Del ChronoWave Watch tenemos 32 unidades disponibles..."

---

## Estructura de Archivos

```
backend/
├── src/
│   ├── controllers/
│   │   └── chat.controller.js        ← Lógica principal del chatbot
│   ├── models/
│   │   └── product.model.js          ← Acceso a productos
│   ├── routes/
│   │   └── chat.routes.js            ← Ruta /api/chat
│   └── middleware/
│       └── auth.middleware.js         ← Autenticación
├── .env                               ← API keys (NO subir a Git)
└── .env.example                       ← Plantilla

frontend/
├── src/app/
│   ├── core/
│   │   ├── services/
│   │   │   └── chat.service.ts       ← Servicio de chat
│   │   └── interceptors/
│   │       └── auth.interceptor.ts    ← Agrega token
│   └── features/admin/
│       └── chatbot/
│           ├── chatbot.ts             ← Componente
│           ├── chatbot.html           ← Template
│           └── chatbot.scss           ← Estilos
```

---

## Próximos Pasos Recomendados

1. **Mejorar Detección de Intenciones**
   - Usar NLP más avanzado
   - Detectar más tipos de consultas

2. **Ampliar Integración con BD**
   - Consultar pedidos del usuario
   - Verificar estado de envíos
   - Buscar en base de conocimiento

3. **Análisis y Métricas**
   - Registrar conversaciones
   - Analizar preguntas frecuentes
   - Medir satisfacción

4. **Funciones Avanzadas**
   - Sugerencias de productos basadas en historial
   - Comparación de productos
   - Alertas de ofertas personalizadas

---

## Soporte y Recursos

- **Documentación DeepSeek**: https://platform.deepseek.com/docs
- **Documentación Groq**: https://console.groq.com/docs
- **Repositorio del Proyecto**: En tu Git

---

**¡Tu chatbot está listo para brindar una experiencia de cliente excepcional!** 🚀
