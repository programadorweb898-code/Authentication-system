import request from 'supertest';
import app from '../src/app.js';
import stripeService from '../infrastructure/services/stripe_service.js';
import { connection } from '../infrastructure/redis.js';
import { authMiddleware } from '../src/domains/auth/middlewares/auth.middlewares.js';

// Mocks
jest.mock('../infrastructure/services/stripe_service.js');
jest.mock('../infrastructure/redis.js');
jest.mock('../src/domains/auth/middlewares/auth.middlewares.js', () => ({
  authMiddleware: (req, res, next) => next(),
}));

describe('Payment API', () => {
  const paymentData = {
    amount: 100,
    currency: 'USD',
    orderId: '60d5ec49f1b2c6001f3e4e1a',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully', async () => {
    stripeService.createPaymentIntent.mockResolvedValue({
      id: 'pi_12345',
      status: 'succeeded',
    });
    connection.get.mockResolvedValue(null); // No previous idempotency key

    const res = await request(app)
      .post('/api/payments/process')
      .set('Idempotency-Key', 'test-key-1')
      .send(paymentData);

    expect(res.status).toBe(201);
    expect(res.body.paymentId).toBe('pi_12345');
  });

  it('should block duplicate requests with same idempotency key', async () => {
    connection.get.mockResolvedValue('processing'); // Key already exists

    const res = await request(app)
      .post('/api/payments/process')
      .set('Idempotency-Key', 'test-key-duplicate')
      .send(paymentData);

    expect(res.status).toBe(409);
  });

  it('should reject webhook with invalid signature', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('stripe-signature', 'invalid-sig')
      .send({ type: 'payment_intent.succeeded' });
    
    expect(res.status).toBe(400);
  });
});
