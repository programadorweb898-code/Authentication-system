import request from 'supertest';
import app from '../src/app.js';
import User from '../src/domains/users/models/user.models.js';
import { createUser } from './factories/user.factory.js';

describe('Auth Flow', () => {
  const registerData = {
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Código de verificación enviado');
      expect(res.body).toHaveProperty('email', registerData.email);

      const user = await User.findOne({ email: registerData.email });
      expect(user).toBeTruthy();
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errores');
    });

    it('should fail if user already exists', async () => {
      await createUser({ email: registerData.email });

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('El usuario ya existe');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return tokens', async () => {
      const user = await createUser({ isVerified: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: registerData.password });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      await createUser({ email: registerData.email, isVerified: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.toLowerCase()).toContain('inválidas');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return a new access token using a valid refresh token', async () => {
      const user = await createUser({ isVerified: true });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: registerData.password });

      expect(loginRes.status).toBe(201);
      const cookie = loginRes.header['set-cookie'];

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_token'])
        .send();

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createUser({ isVerified: true, email: registerData.email });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: registerData.password });

      const { accessToken } = loginRes.body;

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: registerData.password,
          newPassword: 'NewPassword123!',
          confirmNewPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('actualizada correctamente');

      // Intentar login con la nueva contraseña
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: 'NewPassword123!' });

      expect(newLoginRes.status).toBe(201);

      // Verify that refresh tokens are invalidated
      const updatedUserAfterChange = await User.findById(user._id);
      expect(updatedUserAfterChange.refreshTokens).toEqual([]);
    });

    it('should fail if current password is incorrect', async () => {
      await createUser({ isVerified: true, email: registerData.email });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: registerData.password });

      const { accessToken } = loginRes.body;

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword123!',
          confirmNewPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('incorrecta');
    });
  });
});
