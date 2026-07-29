import { getStripe } from '../../../infrastructure/services/stripe_service.js';
import { getPaymentRepository } from '../payment.repository.factory.js';
import logger from '../../../infrastructure/logger.js';

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const repository = getPaymentRepository();
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed.', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await repository.updateStatus(paymentIntent.id, 'succeeded');
      logger.info('Pago exitoso confirmado por webhook', { paymentId: paymentIntent.id });
      break;
    default:
      logger.info(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
};
