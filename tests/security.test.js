import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';

describe('Security and Validation', () => {
  describe('Rate Limiting', () => {
    it('should block after too many requests to register', async () => {
      // requestLimiter has max: 5
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      // 5 requests allowed
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/register')
          .set('x-test-rate-limit', 'true')
          .send(registerData);
      }

      // 6th request should be blocked
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-test-rate-limit', 'true')
        .send(registerData);
      expect(res.status).toBe(429);
      expect(res.body.error).toBe('Demasiados intentos, intenta más tarde');
    });
  });

  describe('JWT Validation', () => {
    it('should fail with no token on protected routes', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No se proporcionó un token de acceso');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token inválido o expirado');
    });

    it('should succeed with valid token', async () => {
      const user = await createUser({ email: 'me@example.com' });
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign({ id: user._id }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'me@example.com');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 with detailed errors for invalid registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'wrong', password: '123', confirmPassword: '123' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errores');
      expect(Array.isArray(res.body.errores)).toBe(true);
    });
  });
});
