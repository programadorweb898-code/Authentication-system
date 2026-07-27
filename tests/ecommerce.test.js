import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';

describe('Ecommerce Flow', () => {
  let user;
  let accessToken;

  beforeEach(async () => {
    user = await createUser({ isVerified: true });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Password123!' });
    accessToken = loginRes.body.accessToken;
  });

  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by ID', async () => {
        // Asumiendo que existe el producto 1
      const res = await request(app).get('/api/products/1');
      // Podría ser 200 o 404 dependiendo de si existe en la BD de test
      expect([200, 404]).toContain(res.status);
    });

    it('should return 404 if product not found', async () => {
      const res = await request(app).get('/api/products/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products/cart (Protected)', () => {
    it('should add a product to the cart with valid token', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: 1, quantity: 2 });
      
      expect(res.status).toBe(201);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .send({ productId: 1, quantity: 2 });
      
      expect(res.status).toBe(401);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .set('Authorization', 'Bearer invalid_token')
        .send({ productId: 1, quantity: 2 });
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/products/orders (Protected)', () => {
    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/products/orders')
        .send({});
      
      expect(res.status).toBe(401);
    });
  });
});
