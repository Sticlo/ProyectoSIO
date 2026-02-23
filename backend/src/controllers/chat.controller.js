const axios = require('axios');
const ProductModel = require('../models/product.model');

// Almacén temporal de conversaciones (en producción usar Redis o base de datos)
const conversationContexts = new Map();
const CONTEXT_EXPIRY = 30 * 60 * 1000; // 30 minutos

class ChatController {
  /**
   * Procesar mensaje del usuario y obtener respuesta de IA
   */
  static async sendMessage(req, res) {
    try {
      const { message, conversationId } = req.body;

      // Validar que se recibió un mensaje
      if (!message || !message.trim()) {
        return res.status(400).json({ 
          error: 'El mensaje es requerido' 
        });
      }

      // Generar ID de conversación si no existe
      const convId = conversationId || ChatController.generateConversationId();

      // Detectar intención del usuario
      const intent = await ChatController.detectIntent(message);
      let additionalContext = '';

      // Si la intención es consultar inventario, obtener datos reales
      if (intent.type === 'product_query' || intent.type === 'inventory_query') {
        const productData = await ChatController.getProductData(intent.product, intent.category);
        additionalContext = productData;
      }

      // Obtener respuesta de la IA con contexto
      const aiResponse = await ChatController.getAIResponse(
        message, 
        convId, 
        additionalContext
      );

      // Limpiar contextos antiguos
      ChatController.cleanOldContexts();

      res.status(200).json({
        message: aiResponse,
        conversationId: convId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      res.status(500).json({ 
        error: 'Error al procesar el mensaje',
        message: 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.'
      });
    }
  }

  /**
   * Detectar la intención del usuario
   */
  static async detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Intención: Consulta de inventario/stock
    if (lowerMessage.match(/cuántos|cuantos|cantidad|stock|inventario|disponible|quedan/)) {
      // Extraer producto mencionado
      const products = ['auriculares', 'bocinas', 'smartwatch', 'reloj'];
      const mentionedProduct = products.find(p => lowerMessage.includes(p));
      
      return {
        type: 'inventory_query',
        product: mentionedProduct,
        category: null
      };
    }

    // Intención: Consulta de producto específico
    if (lowerMessage.match(/precio|costo|vale|características|especificaciones/)) {
      return {
        type: 'product_query',
        product: null,
        category: null
      };
    }

    // Intención: Navegación del sitio
    if (lowerMessage.match(/sección|página|donde|cómo|como|ir a|navegar/)) {
      return {
        type: 'navigation',
        section: null
      };
    }

    return {
      type: 'general',
      product: null,
      category: null
    };
  }

  /**
   * Obtener datos de productos de la base de datos
   */
  static async getProductData(productName, category) {
    try {
      let contextInfo = '';

      if (productName) {
        // Buscar producto específico
        const products = ProductModel.search(productName);
        
        if (products.length > 0) {
          contextInfo = '\n\n[DATOS REALES DE INVENTARIO]:\n';
          products.forEach(p => {
            contextInfo += `- ${p.name}: ${p.stockCount} unidades disponibles, precio: $${p.price}, categoría: ${p.category}\n`;
          });
        }
      } else if (category) {
        // Buscar por categoría
        const products = ProductModel.findByCategory(category);
        contextInfo = `\n\n[PRODUCTOS EN CATEGORÍA ${category}]: ${products.length} productos disponibles\n`;
      } else {
        // Mostrar resumen general
        const allProducts = ProductModel.getAll();
        const totalStock = allProducts.reduce((sum, p) => sum + p.stockCount, 0);
        contextInfo = `\n\n[INVENTARIO TOTAL]: ${allProducts.length} productos, ${totalStock} unidades en stock\n`;
      }

      return contextInfo;
    } catch (error) {
      console.error('Error al obtener datos de productos:', error);
      return '';
    }
  }

  /**
   * Obtener respuesta de la API de IA con contexto
   * Soporta múltiples proveedores gratuitos: DeepSeek, Groq, Hugging Face
   */
  static async getAIResponse(userMessage, conversationId, additionalContext = '') {
    const aiProvider = process.env.AI_PROVIDER || 'deepseek';
    const apiKey = process.env.AI_API_KEY;
    
    // Si no hay API key configurada, usar respuestas predefinidas
    if (!apiKey) {
      console.log('No hay API key configurada, usando respuestas predefinidas');
      return ChatController.getFallbackResponse(userMessage);
    }

    // Obtener o crear contexto de conversación
    const context = ChatController.getOrCreateContext(conversationId);

    // System prompt optimizado para ecommerce
    const systemPrompt = ChatController.getSystemPrompt();

    // Construir historial de mensajes con contexto
    const messages = [
      { role: 'system', content: systemPrompt + additionalContext },
      ...context.messages,
      { role: 'user', content: userMessage }
    ];

    // Guardar mensaje del usuario en el contexto
    context.messages.push({ role: 'user', content: userMessage });

    try {
      let aiResponse;

      console.log(`🤖 [CHATBOT] Llamando a ${aiProvider} con ${messages.length} mensajes...`);

      switch (aiProvider.toLowerCase()) {
        case 'deepseek':
          aiResponse = await ChatController.callDeepSeek(apiKey, messages);
          break;
        case 'groq':
          aiResponse = await ChatController.callGroq(apiKey, messages);
          break;
        case 'huggingface':
          aiResponse = await ChatController.callHuggingFace(apiKey, messages);
          break;
        default:
          console.log(`⚠️ [CHATBOT] Proveedor desconocido: ${aiProvider}, usando respuestas predefinidas`);
          return ChatController.getFallbackResponse(userMessage);
      }

      console.log(`✅ [CHATBOT] Respuesta recibida de ${aiProvider}`);

      // Guardar respuesta de la IA en el contexto
      context.messages.push({ role: 'assistant', content: aiResponse });

      // Limitar el tamaño del contexto (máximo 10 intercambios)
      if (context.messages.length > 20) {
        context.messages = context.messages.slice(-20);
      }

      return aiResponse;
    } catch (error) {
      console.error(`❌ [CHATBOT] Error al llamar a la API de ${aiProvider}:`, error.message);
      console.error('Detalles del error:', error.response?.data || error);
      
      // Si falla la API, usar respuestas predefinidas
      console.log('📝 [CHATBOT] Usando respuesta predefinida (fallback)');
      return ChatController.getFallbackResponse(userMessage);
    }
  }

  /**
   * System prompt optimizado para asistente de ecommerce
   */
  static getSystemPrompt() {
    return `Eres el asistente virtual oficial de una tienda online de tecnología. Tu nombre es "Asistente Virtual".

**IMPORTANTE**: Actúas como representante de ATENCIÓN AL CLIENTE, NO como administrador interno.

**INFORMACIÓN DEL SITIO WEB:**

**Secciones disponibles:**
- **Inicio**: Página principal con productos destacados, ofertas especiales y novedades
- **Productos**: Catálogo completo de productos con filtros por categoría, precio y calificación
- **Categorías**: Organización de productos (Auriculares, Bocinas, Smartwatch, Accesorios)
- **Contacto**: Formulario para enviar consultas, sugerencias o reportar problemas
- **Carrito**: Visualización de productos seleccionados, cálculo de totales y proceso de compra
- **Pedidos**: Seguimiento del estado de pedidos realizados (requiere iniciar sesión)

**Categorías de productos:**
- Auriculares: Auriculares over-ear, in-ear, con cancelación de ruido
- Bocinas: Altavoces portátiles, para hogar, resistentes al agua
- Smartwatch: Relojes inteligentes con monitoreo de salud y fitness
- Accesorios: Cables, cargadores, fundas y más

**TU COMPORTAMIENTO:**

1. **Cuando pregunten por una sección específica** (ej: "¿para qué sirve contacto?"):
   - Explica CLARAMENTE su función para el usuario/cliente
   - Menciona cómo pueden usarla para beneficiarse
   - NO des instrucciones administrativas internas

2. **Consultas de inventario/productos** (ej: "¿cuántos auriculares hay?"):
   - Si recibes datos reales en el contexto [DATOS REALES DE INVENTARIO], úsalos
   - Proporciona información precisa de stock, precios y disponibilidad
   - Sugiere productos alternativos si algo no está disponible

3. **Navegación y ayuda**:
   - Guía al usuario sobre cómo encontrar lo que busca
   - Explica el proceso de compra paso a paso si lo piden
   - Sé proactivo sugiriendo secciones relevantes

4. **Tono y estilo**:
   - Amigable, profesional y servicial
   - Respuestas concisas pero completas
   - Usa emojis ocasionalmente para ser más cercano
   - SIEMPRE en español

5. **Lo que NO debes hacer**:
   - ❌ No menciones "panel de administración"
   - ❌ No des instrucciones para "gestionar" o "editar" cosas
   - ❌ No hables de operaciones internas del negocio
   - ❌ No inventes información de productos si no tienes datos reales

**Mantén contexto de la conversación y responde de forma natural como un representante de servicio al cliente experto.**`;
  }

  /**
   * Obtener o crear contexto de conversación
   */
  static getOrCreateContext(conversationId) {
    if (!conversationContexts.has(conversationId)) {
      conversationContexts.set(conversationId, {
        messages: [],
        createdAt: Date.now(),
        lastActivity: Date.now()
      });
    } else {
      // Actualizar última actividad
      const context = conversationContexts.get(conversationId);
      context.lastActivity = Date.now();
    }
    
    return conversationContexts.get(conversationId);
  }

  /**
   * Limpiar contextos antiguos
   */
  static cleanOldContexts() {
    const now = Date.now();
    for (const [id, context] of conversationContexts.entries()) {
      if (now - context.lastActivity > CONTEXT_EXPIRY) {
        conversationContexts.delete(id);
      }
    }
  }

  /**
   * Generar ID de conversación único
   */
  static generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Llamada a DeepSeek API (Gratuito y Open Source)
   * https://platform.deepseek.com/
   */
  static async callDeepSeek(apiKey, messages) {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Llamada a Groq API (Gratuito, muy rápido)
   * https://console.groq.com/
   */
  static async callGroq(apiKey, messages) {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile', // También: mixtral-8x7b-32768, gemma2-9b-it
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Llamada a Hugging Face Inference API (Gratuito)
   * https://huggingface.co/inference-api
   */
  static async callHuggingFace(apiKey, messages) {
    // Convertir mensajes a formato de texto para Hugging Face
    const prompt = messages.map(m => {
      if (m.role === 'system') return `Sistema: ${m.content}`;
      if (m.role === 'user') return `Usuario: ${m.content}`;
      if (m.role === 'assistant') return `Asistente: ${m.content}`;
      return '';
    }).join('\n\n') + '\n\nAsistente:';

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data[0].generated_text;
  }

  /**
   * Respuestas predefinidas cuando no hay API de IA disponible
   * Orientadas a servicio al cliente del ecommerce
   */
  static getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Saludos
    if (lowerMessage.match(/^(hola|buenas|buenos|hey|hi|saludos)/)) {
      return '¡Hola! 👋 Bienvenido a nuestra tienda. Soy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy? Puedo ayudarte con información sobre productos, guiarte por el sitio web, o responder cualquier consulta que tengas.';
    }

    // Consultas sobre "Contacto" - Mejorada para detectar más variaciones
    if (lowerMessage.match(/contacto/) && lowerMessage.match(/que|qué|para|sirve|hace|es|función|usar/)) {
      return '📧 **La sección de Contacto** te permite comunicarte directamente con nuestro equipo:\n\n💬 Hacer consultas sobre productos específicos\n❓ Resolver dudas sobre tu pedido\n📝 Enviar sugerencias o comentarios\n⚠️ Reportar problemas o inconvenientes\n🤝 Solicitar asesoría personalizada\n\n✍️ Simplemente llena el formulario con tu consulta y te responderemos lo antes posible. ¡Estamos para ayudarte!';
    }

    // Consultas sobre "Inicio"
    if (lowerMessage.match(/inicio|home|principal/) && lowerMessage.match(/que|qué|para|sirve|hace|es|función/)) {
      return '🏠 **La página de Inicio** es tu punto de partida en nuestro sitio. Aquí encontrarás:\n\n✨ Productos destacados y novedades\n🎯 Ofertas especiales del momento\n⭐ Los más vendidos y mejor valorados\n🆕 Últimos productos agregados al catálogo\n\nEs perfecta para descubrir rápidamente las mejores opciones que tenemos para ti.';
    }

    // Consultas sobre "Productos"
    if (lowerMessage.match(/productos?/) && lowerMessage.match(/sección|página|que|qué|para|sirve|hace|es|función/)) {
      return '📦 **La sección de Productos** es nuestro catálogo completo. Aquí puedes:\n\n🔍 Explorar todos nuestros artículos disponibles\n📊 Filtrar por categoría, precio o calificación\n⭐ Ver reseñas y opiniones de otros clientes\n📈 Verificar disponibilidad en stock en tiempo real\n🛒 Agregar productos directamente a tu carrito\n\nEs ideal cuando buscas algo específico o quieres comparar opciones antes de comprar.';
    }

    // Consultas sobre "Categorías"
    if (lowerMessage.match(/categoría|categoria/) && lowerMessage.match(/que|qué|para|sirve|hace|es|función/)) {
      return '🏷️ **En Categorías** organizamos nuestros productos por tipo para facilitarte la búsqueda:\n\n🎧 **Auriculares**: Over-ear, in-ear, con cancelación de ruido\n🔊 **Bocinas**: Portátiles, para hogar, resistentes al agua\n⌚ **Smartwatch**: Relojes inteligentes con monitoreo de salud\n🔌 **Accesorios**: Cables, cargadores, fundas y más\n\n¿Qué tipo de producto te interesa explorar?';
    }

    // Consultas sobre "Carrito"
    if (lowerMessage.match(/carrito/) && lowerMessage.match(/que|qué|para|sirve|hace|es|función|cómo|como/)) {
      return '🛒 **Tu Carrito de Compras** es donde guardas los productos que quieres adquirir:\n\n👀 Ver todos los productos que has seleccionado\n🔢 Modificar cantidades según lo que necesites\n🗑️ Eliminar artículos que cambies de opinión\n💰 Ver el total de tu compra actualizado\n✅ Proceder al pago cuando estés listo\n\nEs como tu "lista de compras" virtual antes de finalizar la transacción.';
    }

    // Consultas sobre "Pedidos"
    if (lowerMessage.match(/pedidos?/) && lowerMessage.match(/sección|página|que|qué|para|sirve|hace|es|función|seguimiento/)) {
      return '📦 **En la sección de Pedidos** (requiere iniciar sesión) puedes:\n\n📋 Ver el historial completo de tus compras\n🚚 Hacer seguimiento en tiempo real del estado de tus pedidos\n📍 Consultar información de envío y entrega\n💳 Ver detalles de cada transacción\n📄 Descargar facturas y comprobantes\n\nEs tu centro de control para todo lo relacionado con tus compras realizadas.';
    }

    // Consultas de inventario
    if (lowerMessage.match(/cuántos|cuantos|cantidad|stock|inventario|disponible|quedan|hay/)) {
      return 'Para consultar la disponibilidad exacta de productos:\n\n🔍 Visita la sección **Productos**\n📊 Cada artículo muestra su stock disponible\n✅ Los productos "En Stock" están listos para envío inmediato\n⏰ Si algo está agotado, puedes suscribirte para recibir notificación\n\n¿Buscas algún producto en particular? Dime cuál y verifico su disponibilidad para ti.';
    }

    // Consultas sobre precios
    if (lowerMessage.match(/precio|costo|vale|cuánto cuesta|cuanto cuesta/)) {
      return 'Los precios de nuestros productos están claramente indicados en cada artículo:\n\n💰 Ofertas especiales marcadas con precio anterior tachado\n🏷️ Todos los precios incluyen IVA\n🎁 Promociones especiales en productos seleccionados\n📦 Envío gratuito en compras mayores a cierto monto\n\nPuedes navegar por **Productos** para ver todos los precios, o dime qué artículo te interesa y te doy información específica.';
    }

    // Cómo comprar
    if (lowerMessage.match(/cómo comprar|como comprar|proceso de compra|comprar/)) {
      return 'Comprar en nuestra tienda es muy sencillo:\n\n1️⃣ **Explora** el catálogo y encuentra lo que buscas\n2️⃣ **Agrega al carrito** los productos que quieras\n3️⃣ **Revisa tu carrito** y ajusta cantidades si lo necesitas\n4️⃣ **Inicia sesión** o regístrate para proceder\n5️⃣ **Completa tus datos** de envío y pago\n6️⃣ **Confirma tu pedido** y listo ✅\n\n📧 Recibirás un correo de confirmación y podrás hacer seguimiento en **Pedidos**.';
    }

    // Navegación general
    if (lowerMessage.match(/dónde|donde|cómo encuentro|como encuentro|navegar|secciones/)) {
      return 'Para navegar por nuestro sitio tenemos estas secciones:\n\n🏠 **Inicio**: Productos destacados y ofertas\n📦 **Productos**: Catálogo completo para explorar\n🏷️ **Categorías**: Busca por tipo de producto\n🛒 **Carrito**: Revisa tus selecciones\n📧 **Contacto**: Comunícate con nosotros\n📦 **Pedidos**: Seguimiento de tus compras\n\n¿Qué estás buscando específicamente? ¡Cuéntame y te guío!';
    }

    // Ayuda general
    if (lowerMessage.match(/ayuda|help|asistencia|necesito/)) {
      return 'Estoy aquí para ayudarte con:\n\n✅ Información sobre productos y disponibilidad\n✅ Guía de navegación por el sitio web\n✅ Explicación del proceso de compra paso a paso\n✅ Responder preguntas sobre cualquier sección\n✅ Ayudarte a encontrar exactamente lo que buscas\n\n¿Con qué necesitas ayuda específicamente? 😊';
    }

    // Preguntas cortas sobre secciones (última verificación)
    if (lowerMessage.match(/^(que|qué).*(contacto|inicio|productos?|categorías?|carrito|pedidos?)/)) {
      // Redirigir a las detecciones específicas de arriba
      if (lowerMessage.includes('contacto')) {
        return '📧 **Contacto** te permite comunicarte directamente con nosotros para consultas, dudas o sugerencias. ¿Necesitas más información sobre cómo usarlo?';
      }
      if (lowerMessage.includes('inicio')) {
        return '🏠 **Inicio** es la página principal donde encuentras productos destacados y ofertas. ¿Quieres saber más detalles?';
      }
      if (lowerMessage.match(/productos?/)) {
        return '📦 **Productos** es nuestro catálogo completo donde puedes explorar y filtrar artículos. ¿Te gustaría más información?';
      }
      if (lowerMessage.match(/categorías?/)) {
        return '🏷️ **Categorías** organiza nuestros productos por tipo para facilitar tu búsqueda. ¿Quieres explorar alguna categoría específica?';
      }
    }

    // Respuesta genérica mejorada
    return `Claro, con gusto te ayudo. Para asistirte mejor:\n\n📌 Puedes preguntarme sobre:\n   • Secciones del sitio (Productos, Categorías, Contacto, etc.)\n   • Disponibilidad y precios de productos\n   • Cómo realizar una compra\n   • Seguimiento de pedidos\n\n💬 ¿Podrías darme más detalles sobre lo que necesitas? Así puedo ayudarte de forma más precisa.`;
  }
}

module.exports = ChatController;
