const Stripe = require('stripe');

// Inicialización lazy: se crea la instancia solo cuando se usa,
// asegurando que dotenv ya cargó STRIPE_SECRET_KEY
let _stripe = null;
function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY no está definida en las variables de entorno');
    _stripe = Stripe(key);
  }
  return _stripe;
}

class PaymentController {

  /**
   * Crear PaymentIntent para tarjeta crédito/débito
   * POST /api/payments/create-intent
   * Body: { amount, currency, customerEmail, customerName, orderId }
   */
  static async createCardIntent(req, res) {
    try {
      const { amount, currency = 'cop', customerEmail, customerName, orderId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a cero' });
      }

      // Stripe requiere el monto en centavos (COP no tiene decimales → misma cantidad)
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await getStripe().paymentIntents.create({
        amount: amountInCents,
        currency,
        payment_method_types: ['card'],
        metadata: {
          orderId: orderId || '',
          customerName: customerName || '',
          customerEmail: customerEmail || '',
        },
        receipt_email: customerEmail || undefined,
        description: `Pedido #${orderId || 'N/A'} - ${customerName || ''}`,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creando PaymentIntent (card):', error);
      res.status(500).json({ error: error.message || 'Error al crear el intent de pago' });
    }
  }

  /**
   * Crear PaymentIntent para PSE (débito bancario Colombia)
   * POST /api/payments/create-pse-intent
   * Body: { amount, currency, customerEmail, customerName, customerPhone, orderId }
   */
  static async createPSEIntent(req, res) {
    try {
      const { amount, currency = 'cop', customerEmail, customerName, customerPhone, orderId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a cero' });
      }

      if (!customerEmail) {
        return res.status(400).json({ error: 'El correo electrónico es requerido para PSE' });
      }

      const amountInCents = Math.round(amount * 100);

      // PSE requiere crear primero el PaymentMethod con datos del banco
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: amountInCents,
        currency,
        payment_method_types: ['pse'],
        metadata: {
          orderId: orderId || '',
          customerName: customerName || '',
          customerPhone: customerPhone || '',
        },
        description: `Pedido #${orderId || 'N/A'} - PSE`,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creando PaymentIntent (PSE):', error);
      res.status(500).json({ error: error.message || 'Error al crear el intent de pago PSE' });
    }
  }

  /**
   * Confirmar pago PSE con banco seleccionado
   * POST /api/payments/confirm-pse
   * Body: { paymentIntentId, bankCode, customerEmail, customerName, returnUrl }
   */
  static async confirmPSE(req, res) {
    try {
      const { paymentIntentId, bankCode, customerEmail, customerName, returnUrl } = req.body;

      if (!paymentIntentId || !bankCode || !customerEmail) {
        return res.status(400).json({ error: 'Faltan datos requeridos para confirmar PSE' });
      }

      // Crear PaymentMethod PSE
      const paymentMethod = await getStripe().paymentMethods.create({
        type: 'pse',
        pse: {
          bank_code: bankCode,
        },
        billing_details: {
          email: customerEmail,
          name: customerName || '',
        },
      });

      // Confirmar el PaymentIntent
      const paymentIntent = await getStripe().paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethod.id,
        return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:4200'}/pago-resultado`,
      });

      res.json({
        status: paymentIntent.status,
        redirectUrl: paymentIntent.next_action?.redirect_to_url?.url || null,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error confirmando PSE:', error);
      res.status(500).json({ error: error.message || 'Error al confirmar pago PSE' });
    }
  }

  /**
   * Verificar estado de un pago
   * GET /api/payments/status/:paymentIntentId
   */
  static async getPaymentStatus(req, res) {
    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      });
    } catch (error) {
      console.error('Error consultando estado del pago:', error);
      res.status(500).json({ error: error.message || 'Error al consultar el pago' });
    }
  }

  /**
   * Webhook de Stripe para confirmar pagos
   * POST /api/payments/webhook
   * (Requiere body crudo - raw - configurado antes de express.json)
   */
  static async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = getStripe().webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Error validando webhook:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        console.log(`✅ Pago exitoso: ${pi.id} | Orden: ${pi.metadata.orderId}`);
        // Aquí puedes actualizar el estado de la orden en la BD
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        console.log(`❌ Pago fallido: ${pi.id} | ${pi.last_payment_error?.message}`);
        break;
      }
      default:
        console.log(`Webhook evento: ${event.type}`);
    }

    res.json({ received: true });
  }
}

module.exports = PaymentController;
