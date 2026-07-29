import Stripe from 'stripe';
import logger from '../logger.js';

let stripe;

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
  }
  return stripe;
}

export { getStripe };

export class StripeService {
  async createPaymentIntent(amount, currency) {
    try {
      const paymentIntent = await getStripe().paymentIntents.create({
        amount,
        currency,
      });
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating PaymentIntent:', error);
      throw error;
    }
  }
}

export default new StripeService();
