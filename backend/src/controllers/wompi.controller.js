const axios = require('axios');
const crypto = require('crypto');

// ─── Base URL según entorno ──────────────────────────────────────────────────
function getBaseUrl() {
  return process.env.WOMPI_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';
}

class WompiController {

  /**
   * Genera la firma de integridad y devuelve los datos para abrir el widget.
   * POST /api/wompi/signature
   * Body: { amount, orderId?, currency? }
   */
  static async getSignatureData(req, res) {
    try {
      const { amount, orderId, currency = 'COP' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a cero' });
      }

      const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
      const publicKey = process.env.WOMPI_PUBLIC_KEY;

      if (!integritySecret) {
        return res.status(500).json({ error: 'WOMPI_INTEGRITY_SECRET no configurado' });
      }
      if (!publicKey) {
        return res.status(500).json({ error: 'WOMPI_PUBLIC_KEY no configurado' });
      }

      const amountInCents = Math.round(amount); // COP ya viene en enteros
      const reference = orderId
        ? `ORD-${orderId}-${Date.now()}`
        : `ORD-${Date.now()}`;

      // Firma: SHA256(reference + amountInCents + currency + integritySecret)
      const signatureString = `${reference}${amountInCents}${currency}${integritySecret}`;
      const integrity = crypto.createHash('sha256').update(signatureString).digest('hex');

      res.json({ publicKey, reference, amountInCents, currency, integrity });
    } catch (error) {
      console.error('[Wompi] getSignatureData error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Consulta el estado de una transacción por su ID.
   * GET /api/wompi/transaction/:id
   */
  static async getTransaction(req, res) {
    try {
      const { id } = req.params;
      const privateKey = process.env.WOMPI_PRIVATE_KEY;

      if (!privateKey) {
        return res.status(500).json({ error: 'WOMPI_PRIVATE_KEY no configurado' });
      }

      const { data } = await axios.get(`${getBaseUrl()}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${privateKey}` },
      });

      res.json(data);
    } catch (error) {
      const status = error.response?.status || 500;
      console.error('[Wompi] getTransaction error:', error.message);
      res.status(status).json({ error: error.response?.data?.error || error.message });
    }
  }

  /**
   * Recibe eventos webhook de Wompi.
   * POST /api/wompi/webhook
   */
  static async webhook(req, res) {
    try {
      const body = req.body;
      const event = body?.event;
      const timestamp = body?.timestamp;
      const signature = body?.signature;

      // ── Verificar firma del webhook ────────────────────────────────────────
      const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
      if (eventsSecret && signature?.checksum) {
        // Concatenar propiedades del evento en orden alfab., + timestamp + eventsSecret
        const properties = body?.data
          ? Object.values(body.data)
              .sort()
              .join('')
          : '';
        const expected = crypto
          .createHash('sha256')
          .update(`${properties}${timestamp}${eventsSecret}`)
          .digest('hex');

        if (expected !== signature.checksum) {
          console.warn('[Wompi] Webhook firma inválida');
          return res.status(401).json({ error: 'Firma inválida' });
        }
      }

      // ── Procesar evento ───────────────────────────────────────────────────
      if (event === 'transaction.updated') {
        const transaction = body?.data?.transaction;
        if (transaction) {
          console.log(`[Wompi] Transacción ${transaction.id} → ${transaction.status}`);
          // TODO: actualizar estado del pedido en la base de datos
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('[Wompi] webhook error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = WompiController;
