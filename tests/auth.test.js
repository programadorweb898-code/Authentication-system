import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.models.js';
import { createUser } from './factories/user.factory.js';

describe('Auth Flow', () => {
  const registerData = {
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(registerData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('usuario registrado correctsmente');
      expect(res.body.user).toHaveProperty('email', registerData.email);

      const user = await User.findOne({ email: registerData.email });
      expect(user).toBeTruthy();
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ email: 'invalid-email', password: 'Password123!', confirmPassword: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errores');
    });

    it('should fail if user already exists', async () => {
      await createUser({ email: registerData.email });

      const res = await request(app)
        .post('/api/register')
        .send(registerData);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('El usuario ya existe');
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully and return tokens', async () => {
      await request(app).post('/api/register').send(registerData);

      const res = await request(app)
        .post('/api/login')
        .send({ email: registerData.email, password: registerData.password });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      await request(app).post('/api/register').send(registerData);

      const res = await request(app)
        .post('/api/login')
        .send({ email: registerData.email, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      // The implementation throws "Credenciales incorrectas" or "credenciales invalidas"
      expect(res.body.error.toLowerCase()).toContain('credenciales');
    });
  });

  describe('POST /api/refresh', () => {
    it('should return a new access token using a valid refresh token', async () => {
      await request(app).post('/api/register').send(registerData);
      const loginRes = await request(app).post('/api/login').send({ email: registerData.email, password: registerData.password });
      
      expect(loginRes.status).toBe(201);
      const cookie = loginRes.header['set-cookie'];

      const res = await request(app)
        .post('/api/refresh')
        .set('Cookie', cookie)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .set('Cookie', ['refreshToken=invalid_token'])
        .send();

      expect(res.status).toBe(401);
    });
  });
});
