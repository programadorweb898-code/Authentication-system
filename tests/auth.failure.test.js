import request from 'supertest';
import app from '../src/app.js';
import { jest } from '@jest/globals';
import * as authServices from '../src/domains/auth/services/auth.services.js';

// Mockear el módulo de servicios de auth
jest.mock('../src/domains/auth/services/auth.services.js');

describe('Auth Failure Flow', () => {
  const registerData = {
    email: 'fail-test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  describe('POST /api/auth/register - Infrastructure Failures', () => {
    it('should return 500 if notification service fails', async () => {
      // Configurar el mock para lanzar un error
      authServices.registerUser.mockRejectedValueOnce(new Error('Resend API Error'));

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(res.status).toBe(500);
    });

    it('should return 500 if database fails during user creation', async () => {
      // Configurar el mock para lanzar un error
      authServices.registerUser.mockRejectedValueOnce(new Error('DB Connection Error'));

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });
  describe('POST /api/auth/login - Security Failures', () => {
    it('should return 400 for malformed request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email' }); // Falta contraseña y email inválido

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errores');
    });
  });
});
