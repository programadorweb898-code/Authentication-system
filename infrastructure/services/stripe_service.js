import Stripe from 'stripe';
import logger from '../logger.js';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripeService {
  async createPaymentIntent(amount, currency) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
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
