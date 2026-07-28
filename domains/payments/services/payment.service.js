import { getPaymentRepository } from '../payment.repository.factory.js';
import stripeService from '../../../infrastructure/services/stripe_service.js';
import logger from '../../../infrastructure/logger.js';

export class PaymentService {
  constructor() {
    this.repository = getPaymentRepository();
  }

  async processPayment(paymentData) {
    try {
      logger.info('Iniciando proceso de pago', { orderId: paymentData.orderId });

      // 1. Procesar pago en Stripe
      const paymentIntent = await stripeService.createPaymentIntent(
        paymentData.amount,
        paymentData.currency
      );

      // 2. Persistir registro en BD
      const paymentRecord = await this.repository.create({
        paymentId: paymentIntent.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentIntent.status,
        orderId: paymentData.orderId,
      });

      logger.info('Pago procesado y registrado exitosamente', { paymentId: paymentRecord.paymentId });
      return paymentRecord;

    } catch (error) {
      logger.error('Error en el servicio de pagos', { error: error.message, orderId: paymentData.orderId });
      throw error;
    }
  }
}

export default new PaymentService();
