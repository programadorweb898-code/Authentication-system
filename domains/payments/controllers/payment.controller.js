import paymentService from '../services/payment.service.js';
import logger from '../../infrastructure/logger.js';

export const processPayment = async (req, res) => {
  try {
    const { amount, currency, orderId } = req.body;

    if (!amount || !currency || !orderId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const payment = await paymentService.processPayment({ amount, currency, orderId });
    res.status(201).json(payment);
  } catch (error) {
    logger.error('Error en PaymentController.processPayment', { error: error.message });
    res.status(500).json({ error: 'Error interno al procesar el pago' });
  }
};
