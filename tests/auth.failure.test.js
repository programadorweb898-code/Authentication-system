import request from 'supertest';
import app from '../src/app.js';
import { jest } from '@jest/globals';
import { getRepositories, getAuthService } from '../src/factory.js';
import { createUser } from './factories/user.factory.js';
import jwt from 'jsonwebtoken';

describe('Auth Failure Flow - Infrastructure Errors', () => {
  let repositories;

  beforeAll(async () => {
    repositories = await getRepositories();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 500 when database fails during user lookup', async () => {
      jest.spyOn(repositories.userRepository, 'findByEmail')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });

    it('should return 500 when database fails during save after login', async () => {
      const user = await createUser({ isVerified: true });

      jest.spyOn(repositories.userRepository, 'save')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });

    it('should return 500 when token service fails during login', async () => {
      const user = await createUser({ isVerified: true });

      const authService = await getAuthService();
      jest.spyOn(authService.tokenService, 'sign')
        .mockImplementation(() => { throw new Error('Token signing failed'); });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 500 when database fails during user existence check', async () => {
      jest.spyOn(repositories.userRepository, 'findByEmail')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });

    it('should return 500 when database fails during user creation', async () => {
      jest.spyOn(repositories.userRepository, 'create')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });

    it('should return 500 when password hasher fails during register', async () => {
      jest.spyOn(repositories.userRepository, 'findByEmail')
        .mockResolvedValue(null);

      const authService = await getAuthService();
      jest.spyOn(authService.passwordHasher, 'hash')
        .mockRejectedValue(new Error('Hashing failed'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 when database fails during token refresh', async () => {
      const validRefreshToken = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      jest.spyOn(repositories.userRepository, 'findById')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${validRefreshToken}`])
        .send();

      expect(res.status).toBe(401);
    });

    it('should return 401 when save fails during token rotation', async () => {
      const user = await createUser({ isVerified: true });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      const cookie = loginRes.header['set-cookie'];

      jest.spyOn(repositories.userRepository, 'save')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .send();

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when token blacklist check fails due to database error', async () => {
      jest.spyOn(repositories.tokenBlacklistRepository, 'isBlacklisted')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer some-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token inválido o expirado');
    });

    it('should return 401 when user lookup fails due to database error', async () => {
      const validToken = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      jest.spyOn(repositories.userRepository, 'findById')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token inválido o expirado');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should return 500 when database fails during save', async () => {
      const user = await createUser({ isVerified: true });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      const { accessToken } = loginRes.body;

      jest.spyOn(repositories.userRepository, 'save')
        .mockRejectedValue(new Error('Database connection lost'));

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!',
          confirmNewPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });
});
