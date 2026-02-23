# Configuración del Chatbot con IA

## 🚀 Inicio Rápido (2 minutos)

### Opción 1: DeepSeek (Recomendado)
```bash
# 1. Obtén tu API key gratis en: https://platform.deepseek.com/
# 2. Agrega en backend/.env:
AI_PROVIDER=deepseek
AI_API_KEY=tu_key_aqui

# 3. Instala dependencias e inicia:
cd backend
npm install
npm run dev
```

### Opción 2: Groq (Más rápido)
```bash
# 1. Obtén tu API key gratis en: https://console.groq.com/
# 2. Agrega en backend/.env:
AI_PROVIDER=groq
AI_API_KEY=tu_key_aqui

# 3. Instala e inicia:
cd backend
npm install
npm run dev
```

---

## Descripción

El chatbot con inteligencia artificial está integrado en el panel de administración y permite a los administradores obtener respuestas instantáneas sobre el sistema de gestión.

## Características

- ✅ Interfaz de chat intuitiva y moderna
- ✅ Indicador de "escribiendo..." mientras procesa respuestas
- ✅ Historial de conversación
- ✅ **Integración con múltiples IAs gratuitas y open source**:
  - **DeepSeek** (Gratuito, sin límites, muy bueno)
  - **Groq** (Gratuito, ultra rápido, Llama 3.3 70B)
  - **Hugging Face** (Gratuito, Mixtral 8x7B)
- ✅ Sistema de respuestas predefinidas (fallback)
- ✅ Solo accesible para administradores autenticados
- ✅ **100% Gratuito - Sin costos ni límites**

## Funcionamiento

### Frontend (Angular)
- **Componente**: `ChatbotComponent` ubicado en `/frontend/ProyectoSIO/src/app/features/admin/chatbot/`
- **Servicio**: `ChatService` ubicado en `/frontend/ProyectoSIO/src/app/core/services/chat.service.ts`
- **Características visuales**:
  - Botón flotante para abrir/cerrar el chat
  - Mensajes diferenciados entre usuario y asistente
  - Auto-scroll al último mensaje
  - Diseño responsive

### Backend (Node.js)
- **Controlador**: `chat.controller.js` en `/backend/src/controllers/`
- **Ruta**: `/api/chat` (POST) - Protegida con autenticación
- **Proveedores de IA soportados**:
  1. **DeepSeek** (Recomendado) - Gratuito, sin límites, excelente calidad
  2. **Groq** - Gratuito, ultra rápido, usa Llama 3.3 70B
  3. **Hugging Face** - Gratuito, usa Mixtral 8x7B
  4. **Modo Fallback** - Respuestas predefinidas sin necesidad de API

## Instalación

### 1. Instalar dependencias del backend

```bash
cd backend
npm install
```

Esto instalará `axios` que es necesario para comunicarse con la API de OpenAI.

### 2. Configurar variables de entorno

Elige uno de los siguientes proveedores gratuitos de IA y configura tu archivo `.env` en el backend:

#### Opción 1: DeepSeek (Recomendado) ⭐

**¿Por qué DeepSeek?**
- ✅ Completamente gratuito
- ✅ Sin límites de uso
- ✅ Excelente calidad de respuestas
- ✅ Modelo open source muy potente

```env
# DeepSeek Configuration
AI_PROVIDER=deepseek
AI_API_KEY=tu_deepseek_api_key_aqui
```

**Cómo obtener tu API Key de DeepSeek:**
1. Ve a https://platform.deepseek.com/
2. Crea una cuenta gratuita
3. Ve a "API Keys" en tu dashboard
4. Crea una nueva API key (100% gratis, sin pago)
5. Copia y pega en tu archivo `.env`

#### Opción 2: Groq (Ultra Rápido) 🚀

**¿Por qué Groq?**
- ✅ Completamente gratuito
- ✅ Ultra rápido (respuestas en menos de 1 segundo)
- ✅ Usa Llama 3.3 70B (muy potente)
- ✅ Sin límites generosos

```env
# Groq Configuration
AI_PROVIDER=groq
AI_API_KEY=tu_groq_api_key_aqui
```

**Cómo obtener tu API Key de Groq:**
1. Ve a https://console.groq.com/
2. Crea una cuenta gratuita (con GitHub o email)
3. Ve a "API Keys"
4. Crea una nueva API key
5. Copia y pega en tu archivo `.env`

#### Opción 3: Hugging Face

**¿Por qué Hugging Face?**
- ✅ Gratuito
- ✅ Acceso a múltiples modelos
- ✅ Usa Mixtral 8x7B

```env
# Hugging Face Configuration
AI_PROVIDER=huggingface
AI_API_KEY=tu_huggingface_token_aqui
```

**Cómo obtener tu token de Hugging Face:**
1. Ve a https://huggingface.co/
2. Crea una cuenta
3. Ve a Settings > Access Tokens
4. Crea un nuevo token (read)
5. Copia y pega en tu archivo `.env`

#### Opción 4: Sin API (Modo Fallback)

Si no quieres configurar ninguna API, simplemente no agregues nada al `.env`. El sistema funcionará con respuestas predefinidas inteligentes.

**Nota**: Para producción, se recomienda usar DeepSeek o Groq por su excelente relación calidad-velocidad y porque son completamente gratuitos.

## Uso

### Para usuarios finales

1. Inicia sesión como administrador en el sistema
2. Ve al panel de administración
3. Busca el botón flotante morado en la esquina inferior derecha
4. Haz clic para abrir el chat
5. Escribe tu pregunta y presiona Enter o el botón de enviar
6. El asistente responderá basándose en IA o respuestas predefinidas

### Ejemplos de preguntas

- "¿Cómo agrego un nuevo producto?"
- "¿Cómo funciona el inventario?"
- "¿Dónde veo los pedidos pendientes?"
- "¿Cómo registro un gasto?"
- "¿Cómo genero un reporte financiero?"

## Respuestas Predefinidas (Modo Fallback)

Cuando no hay API key configurada, el chatbot responde basándose en palabras clave:

| Tema | Palabras clave detectadas |
|------|--------------------------|
| Productos | producto, artículo |
| Inventario | inventario, stock, existencia |
| Pedidos | pedido, orden, compra |
| Finanzas | gasto, finanza, dinero, costo |
| Reportes | reporte, informe, estadística |
| Ayuda | ayuda, cómo |
| Saludos | hola, buenos, buenas |

## Personalización

### Cambiar de proveedor de IA

Simplemente modifica la variable `AI_PROVIDER` en tu `.env`:

```env
AI_PROVIDER=deepseek  # O groq, o huggingface
```

### Modificar el comportamiento de la IA

Edita el prompt del sistema en `backend/src/controllers/chat.controller.js`:

```javascript
const systemPrompt = `Tu texto personalizado aquí...`;
```

### Cambiar el modelo de IA

En `chat.controller.js`, puedes cambiar el modelo dentro de cada función:

**Para Groq:**
```javascript
model: 'llama-3.3-70b-versatile', // O: mixtral-8x7b-32768, gemma2-9b-it
```

**Para Hugging Face:**
```javascript
'https://api-inference.huggingface.co/models/tu-modelo-preferido'
```

### Agregar más respuestas predefinidas

Agrega nuevas condiciones en el método `getFallbackResponse()` en el mismo archivo:

```javascript
if (lowerMessage.includes('tu_palabra_clave')) {
  return 'Tu respuesta personalizada';
}
```

### Personalizar la apariencia

Edita los estilos en `frontend/ProyectoSIO/src/app/features/admin/chatbot/chatbot.scss`

## Seguridad

- ✅ Ruta protegida con middleware de autenticación
- ✅ Solo administradores pueden acceder
- ✅ No se almacenan conversaciones en base de datos
- ✅ API keys guardadas en variables de entorno (no en código)
- ✅ Conexión HTTPS encriptada con los proveedores de IA

## Limitaciones

- No se conecta a la base de datos del sistema
- Solo responde con información textual
- Las respuestas predefinidas son limitadas sin API de IA
- No puede ejecutar acciones en el sistema (solo provee información)

## Costos

### 🎉 ¡Completamente GRATIS!

Todos los proveedores recomendados son 100% gratuitos:

| Proveedor | Costo | Límites | Velocidad | Calidad |
|-----------|-------|---------|-----------|---------|
| **DeepSeek** | 🟢 Gratis | Sin límites reales | Media | ⭐⭐⭐⭐⭐ Excelente |
| **Groq** | 🟢 Gratis | Generosos | Ultra rápida | ⭐⭐⭐⭐⭐ Excelente |
| **Hugging Face** | 🟢 Gratis | Rate limits básicos | Media | ⭐⭐⭐⭐ Muy buena |
| **Fallback** | 🟢 Gratis | Ilimitado | Instantánea | ⭐⭐⭐ Básica |

**Recomendación:** Usa **DeepSeek** o **Groq** para la mejor experiencia sin ningún costo.

## Solución de problemas

### El chatbot no aparece
- Verifica que estés en la página de administración
- Confirma que tu usuario tiene rol de administrador

### Error al enviar mensaje
- Verifica que el backend esté ejecutándose
- Revisa que la ruta `/api/chat` esté disponible
- Comprueba la consola del navegador para más detalles

### Respuestas lentas
- **DeepSeek**: Pueden tardar 2-4 segundos (normal)
- **Groq**: Debería responder en menos de 1 segundo (muy rápido)
- **Hugging Face**: Primera petición puede tardar más (el modelo se "despierta")
- Verifica tu conexión a internet

### Error de API Key
- Verifica que `AI_API_KEY` esté correctamente configurada en `.env`
- Asegúrate de que `AI_PROVIDER` coincida con el proveedor de tu key
- Comprueba que no haya espacios extra en el `.env`
- Reinicia el servidor backend después de modificar `.env`

### Respuestas en inglés
- Modifica el `systemPrompt` en `chat.controller.js` para enfatizar respuestas en español
- DeepSeek y Groq respetan muy bien el idioma del prompt

### Respuestas genéricas o básicas
- Si estás usando el modo fallback, configura alguna API gratuita
- Agrega más respuestas predefinidas según tus necesidades

### Error 429 (Rate Limit)
- **Groq**: Espera unos minutos entre muchas peticiones
- **Hugging Face**: Puede tener rate limits más estrictos
- **DeepSeek**: Generalmente no tiene problemas de límites

### Verificar configuración

Ejecuta en tu terminal (dentro de `/backend`):
```bash
node -p "require('dotenv').config(); console.log({provider: process.env.AI_PROVIDER, hasKey: !!process.env.AI_API_KEY})"
```

## Mejoras futuras

Posibles mejoras que se pueden implementar:

- [ ] Guardar historial de conversaciones en base de datos
- [ ] Integración con la base de datos para consultas en tiempo real
- [ ] Soporte para múltiples idiomas
- [ ] Análisis de sentimiento
- [ ] Exportar conversaciones
- [ ] Comandos especiales (ej: "/reportes")
- [ ] Sugerencias automáticas de preguntas
- [ ] Integración con otros modelos de IA (Claude, Gemini, etc.)

## Soporte

Para más información o ayuda, consulta la documentación principal del proyecto o contacta al equipo de desarrollo.
