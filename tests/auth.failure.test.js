import request from 'supertest';
import app from '../src/app.js';
import { jest } from '@jest/globals';

describe('Auth Failure Flow', () => {
  describe('POST /api/auth/login - Security Failures', () => {
    it('should return 400 for malformed request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errores');
    });
  });
});
