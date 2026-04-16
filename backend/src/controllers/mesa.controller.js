const axios = require('axios');
const ProductModel = require('../models/product.model');
const OrderModel = require('../models/order.model');

// =============================================
// CHATBOT MESERO DIGITAL - PEDIDOS POR QR
// =============================================

// Sesiones por mesa (2 horas de expiración)
const sesiones = new Map();
const EXPIRACION = 2 * 60 * 60 * 1000;

class MesaController {

  /**
   * POST /api/mesa/:mesaId/chat
   * Endpoint público — accesible desde el QR sin autenticación
   */
  static async chat(req, res) {
    try {
      const { mesaId } = req.params;
      const { message, sessionId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'El mensaje es requerido' });
      }

      const sesionId = sessionId || MesaController.generarSesionId(mesaId);
      const mensajeLimpio = message.trim();

      // Obtener o crear sesión
      const sesion = MesaController.obtenerOCrearSesion(sesionId, mesaId);
      sesion.ultimaActividad = Date.now();

      // Detectar intención
      const intencion = MesaController.detectarIntencion(mensajeLimpio.toLowerCase());

      let respuesta;
      let pedidoCreado = null;

      // ── VER CARTA ──────────────────────────────────────────
      if (intencion === 'ver_carta') {
        const productos = await ProductModel.getAll();
        respuesta = MesaController.formatearCarta(productos);
      }

      // ── VER PEDIDO EN CURSO ─────────────────────────────────
      else if (intencion === 'ver_pedido') {
        respuesta = MesaController.formatearPedidoEnCurso(sesion);
      }

      // ── CONFIRMAR PEDIDO ────────────────────────────────────
      else if (intencion === 'confirmar_pedido') {
        if (!sesion.pedido || sesion.pedido.length === 0) {
          respuesta = '🛒 Tu pedido está vacío. Primero dime qué deseas pedir. Escribe *"ver carta"* para ver los productos disponibles.';
        } else {
          try {
            const orden = await MesaController.crearOrden(sesion, mesaId);
            pedidoCreado = orden;
            sesion.pedido = [];
            sesion.ordenesCreadas.push(orden.id);
            respuesta = `✅ *¡Pedido confirmado!* Tu orden #${orden.id} ha sido enviada a cocina.\n\n` +
              `🍽️ En breve estará listo. ¡Gracias por tu pedido!\n\n` +
              `Si necesitas algo más, no dudes en escribirme.`;
          } catch (err) {
            console.error('Error creando orden:', err);
            respuesta = '❌ Hubo un error al confirmar tu pedido. Por favor avisa a un mesero o intenta de nuevo.';
          }
        }
      }

      // ── CANCELAR / VACIAR PEDIDO ────────────────────────────
      else if (intencion === 'cancelar_pedido') {
        sesion.pedido = [];
        respuesta = '🗑️ Tu pedido ha sido vaciado. Puedes empezar de nuevo. Escribe *"ver carta"* para elegir productos.';
      }

      // ── AGREGAR PRODUCTO (intención de pedir algo) ──────────
      else if (intencion === 'agregar_producto') {
        const productos = await ProductModel.getAll();
        const resultado = MesaController.interpretarPedido(mensajeLimpio, productos);

        if (resultado.encontrados.length > 0) {
          for (const item of resultado.encontrados) {
            MesaController.agregarAlPedido(sesion, item);
          }
          const resumen = resultado.encontrados.map(i => `• ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toLocaleString()}`).join('\n');
          respuesta = `✅ *Agregado a tu pedido:*\n${resumen}\n\n` +
            `Puedes seguir pidiendo, escribir *"ver pedido"* para revisar, o *"confirmar pedido"* para enviar a cocina.`;
        } else {
          // Sin match claro → consultar IA
          respuesta = await MesaController.consultarIA(mensajeLimpio, sesionId, sesion, mesaId, productos);
        }
      }

      // ── SALUDO ──────────────────────────────────────────────
      else if (intencion === 'saludo') {
        respuesta = `👋 ¡Bienvenido a la mesa ${mesaId}! Soy tu mesero digital.\n\n` +
          `Puedo ayudarte a:\n` +
          `🍽️ *"ver carta"* — Ver todos los productos disponibles\n` +
          `🛒 *"quiero pedir..."* — Agregar productos a tu pedido\n` +
          `📋 *"ver pedido"* — Revisar lo que llevas pedido\n` +
          `✅ *"confirmar pedido"* — Enviar tu pedido a cocina\n\n` +
          `¿Qué deseas hoy?`;
      }

      // ── FALLBACK → IA ────────────────────────────────────────
      else {
        const productos = await ProductModel.getAll();
        respuesta = await MesaController.consultarIA(mensajeLimpio, sesionId, sesion, mesaId, productos);
      }

      // Guardar en historial de sesión
      sesion.historial.push({ role: 'user', content: mensajeLimpio });
      sesion.historial.push({ role: 'assistant', content: respuesta });
      if (sesion.historial.length > 30) sesion.historial = sesion.historial.slice(-30);

      MesaController.limpiarSesionesAntiguas();

      res.status(200).json({
        message: respuesta,
        sessionId: sesionId,
        mesaId,
        pedidoActual: sesion.pedido,
        pedidoCreado,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ [MESA] Error:', error.message);
      res.status(500).json({ error: 'Error al procesar el mensaje' });
    }
  }

  /**
   * GET /api/mesa/:mesaId/carta
   * Devuelve la carta en JSON para que el frontend la pueda mostrar
   */
  static async getCarta(req, res) {
    try {
      const productos = await ProductModel.getAll();
      const carta = productos
        .filter(p => p.in_stock && p.stock_count > 0)
        .map(p => ({
          id: p.id,
          nombre: p.name,
          descripcion: p.description,
          precio: p.price,
          imagen: p.image,
          categoria: p.category_name,
          badge: p.badge
        }));

      // Agrupar por categoría
      const porCategoria = {};
      for (const p of carta) {
        const cat = p.categoria || 'Otros';
        if (!porCategoria[cat]) porCategoria[cat] = [];
        porCategoria[cat].push(p);
      }

      res.json({ carta: porCategoria, total: carta.length });
    } catch (error) {
      console.error('❌ [MESA] Error obteniendo carta:', error);
      res.status(500).json({ error: 'Error al obtener la carta' });
    }
  }

  // ─── DETECCIÓN DE INTENCIÓN ──────────────────────────────────

  static detectarIntencion(texto) {
    if (/^(hola|buenos|buenas|buen|hey|hi|saludos|buenas (tardes|noches|dias)|que tal)/.test(texto)) return 'saludo';
    if (/ver carta|mostrar carta|la carta|el menu|ver menu|que tienen|que hay|que ofrecen|productos disponibles/.test(texto)) return 'ver_carta';
    if (/ver pedido|mi pedido|que llevo|resumen.*pedido|pedido actual|cuanto llevo/.test(texto)) return 'ver_pedido';
    if (/confirmar|enviar pedido|mandar pedido|listo.*pedido|pedido.*listo|hacer pedido|ordenar|ya.*todo/.test(texto)) return 'confirmar_pedido';
    if (/cancelar|vaciar|borrar.*pedido|empezar de nuevo|quitar todo/.test(texto)) return 'cancelar_pedido';
    if (/quiero|pedir|dame|quisiera|me das|un |una |dos |tres |cuatro |cinco |\d+ /.test(texto)) return 'agregar_producto';
    return 'general';
  }

  // ─── INTERPRETAR QUÉ PRODUCTO QUIERE PEDIR ──────────────────

  static interpretarPedido(mensaje, productos) {
    const texto = mensaje.toLowerCase();
    const encontrados = [];

    // Extraer cantidad con regex
    const cantidadMatch = texto.match(/(\d+)\s+/);
    const palabrasCantidad = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };
    let cantidad = cantidadMatch ? parseInt(cantidadMatch[1]) : 1;
    for (const [palabra, num] of Object.entries(palabrasCantidad)) {
      if (texto.includes(palabra + ' ')) { cantidad = num; break; }
    }

    for (const producto of productos) {
      if (!producto.in_stock || producto.stock_count <= 0) continue;
      const nombreProd = producto.name.toLowerCase();
      // Buscar si el nombre del producto o partes de él están en el mensaje
      const palabrasProducto = nombreProd.split(' ');
      const coincidencias = palabrasProducto.filter(p => p.length > 3 && texto.includes(p));
      if (coincidencias.length > 0 || texto.includes(nombreProd)) {
        encontrados.push({
          id: producto.id,
          nombre: producto.name,
          precio: producto.price,
          cantidad,
          stockDisponible: producto.stock_count
        });
      }
    }

    return { encontrados };
  }

  // ─── GESTIÓN DEL PEDIDO EN CURSO ────────────────────────────

  static agregarAlPedido(sesion, item) {
    const existente = sesion.pedido.find(p => p.id === item.id);
    if (existente) {
      existente.cantidad += item.cantidad;
    } else {
      sesion.pedido.push({ ...item });
    }
  }

  static formatearPedidoEnCurso(sesion) {
    if (!sesion.pedido || sesion.pedido.length === 0) {
      return '🛒 Tu pedido está vacío. Escribe *"ver carta"* para elegir productos o cuéntame qué deseas.';
    }
    const total = sesion.pedido.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const items = sesion.pedido.map(i =>
      `• ${i.cantidad}x *${i.nombre}* — $${(i.precio * i.cantidad).toLocaleString()}`
    ).join('\n');
    return `🛒 *Tu pedido actual:*\n${items}\n\n💰 *Total: $${total.toLocaleString()}*\n\n¿Deseas agregar algo más o escribes *"confirmar pedido"* para enviar a cocina?`;
  }

  // ─── CREAR ORDEN EN LA BASE DE DATOS ────────────────────────

  static async crearOrden(sesion, mesaId) {
    const items = sesion.pedido.map(item => ({
      productId: item.id,
      name: item.nombre,
      quantity: item.cantidad,
      price: item.precio
    }));
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const orden = await OrderModel.create({
      phoneNumber: `mesa-${mesaId}`,
      customerName: `Mesa ${mesaId}`,
      customerAddress: `Mesa ${mesaId}`,
      items,
      total,
      shippingCost: 0,
      notes: `Pedido desde mesa ${mesaId} vía QR`
    });

    return orden;
  }

  // ─── FORMATEAR CARTA ─────────────────────────────────────────

  static formatearCarta(productos) {
    const disponibles = productos.filter(p => p.in_stock && p.stock_count > 0);
    if (disponibles.length === 0) {
      return '😔 Por el momento no hay productos disponibles. Por favor consulta con un mesero.';
    }

    // Agrupar por categoría
    const porCategoria = {};
    for (const p of disponibles) {
      const cat = p.category_name || 'Otros';
      if (!porCategoria[cat]) porCategoria[cat] = [];
      porCategoria[cat].push(p);
    }

    let carta = '🍽️ *Nuestra Carta:*\n\n';
    for (const [cat, items] of Object.entries(porCategoria)) {
      carta += `*── ${cat} ──*\n`;
      for (const p of items) {
        carta += `• *${p.name}* — $${Number(p.price).toLocaleString()}\n`;
        if (p.description) carta += `  _${p.description.substring(0, 60)}${p.description.length > 60 ? '...' : ''}_\n`;
      }
      carta += '\n';
    }
    carta += '💬 Solo dime qué deseas, por ejemplo: *"quiero 2 auriculares"* y lo agrego a tu pedido.';
    return carta;
  }

  // ─── IA PARA MENSAJES AMBIGUOS ───────────────────────────────

  static async consultarIA(mensaje, sesionId, sesion, mesaId, productos) {
    const apiKey = process.env.AI_API_KEY;
    const proveedor = process.env.AI_PROVIDER || 'deepseek';

    if (!apiKey) return MesaController.respaldoSinIA(mensaje);

    const cartaTexto = productos
      .filter(p => p.in_stock)
      .map(p => `- ${p.name}: $${p.price} (stock: ${p.stock_count})`)
      .join('\n');

    const pedidoActual = sesion.pedido.length > 0
      ? sesion.pedido.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')
      : 'ninguno';

    const systemPrompt = `Eres un mesero digital amigable y eficiente para la Mesa ${mesaId}. Tu trabajo es ayudar al cliente a pedir comida/productos.

CARTA DISPONIBLE:
${cartaTexto}

PEDIDO ACTUAL DEL CLIENTE: ${pedidoActual}

REGLAS:
1. Responde SIEMPRE en español, de forma amable y breve.
2. Si el cliente quiere pedir algo, confirma lo que entendiste y dile que diga "confirmar pedido" cuando esté listo.
3. Si pide algo que NO está en la carta, discúlpate e indica qué sí hay disponible.
4. Si pregunta precios, informa desde la carta.
5. Nunca inventes productos que no estén en la carta.
6. Usa emojis con moderación para ser más cercano.
7. Guía siempre al cliente hacia las acciones: "ver carta", "confirmar pedido", "ver pedido".`;

    const mensajes = [
      { role: 'system', content: systemPrompt },
      ...sesion.historial.slice(-10),
      { role: 'user', content: mensaje }
    ];

    try {
      let respuesta;
      if (proveedor === 'deepseek') {
        const r = await axios.post('https://api.deepseek.com/v1/chat/completions',
          { model: 'deepseek-chat', messages: mensajes, max_tokens: 400, temperature: 0.5 },
          { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 12000 }
        );
        respuesta = r.data.choices[0].message.content;
      } else if (proveedor === 'groq') {
        const r = await axios.post('https://api.groq.com/openai/v1/chat/completions',
          { model: 'llama-3.3-70b-versatile', messages: mensajes, max_tokens: 400, temperature: 0.5 },
          { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 12000 }
        );
        respuesta = r.data.choices[0].message.content;
      } else {
        return MesaController.respaldoSinIA(mensaje);
      }
      return respuesta;
    } catch (err) {
      console.error('❌ [MESA] Error IA:', err.message);
      return MesaController.respaldoSinIA(mensaje);
    }
  }

  static respaldoSinIA(mensaje) {
    return '🤔 No entendí bien tu mensaje. Puedes:\n\n' +
      '🍽️ Escribir *"ver carta"* para ver los productos\n' +
      '🛒 Decirme *"quiero [producto]"* para pedir\n' +
      '📋 Escribir *"ver pedido"* para ver lo que llevas\n' +
      '✅ Escribir *"confirmar pedido"* para enviar a cocina';
  }

  // ─── GESTIÓN DE SESIONES ─────────────────────────────────────

  static obtenerOCrearSesion(sesionId, mesaId) {
    if (!sesiones.has(sesionId)) {
      sesiones.set(sesionId, {
        mesaId,
        pedido: [],
        historial: [],
        ordenesCreadas: [],
        creadoEn: Date.now(),
        ultimaActividad: Date.now()
      });
    }
    return sesiones.get(sesionId);
  }

  static generarSesionId(mesaId) {
    return `mesa_${mesaId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  static limpiarSesionesAntiguas() {
    const ahora = Date.now();
    for (const [id, sesion] of sesiones.entries()) {
      if (ahora - sesion.ultimaActividad > EXPIRACION) sesiones.delete(id);
    }
  }
}

module.exports = MesaController;
