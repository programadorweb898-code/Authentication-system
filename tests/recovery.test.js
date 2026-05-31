import request from 'supertest';
import app from '../src/app.js';
import User from '../src/domains/users/models/user.models.js';
import { createUser } from './factories/user.factory.js';
import { jest } from '@jest/globals';

// Mock notification services
jest.unstable_mockModule(
  '../src/domains/notifications/services/email.services.js',
  () => ({
    sendRecoveryEmail: jest.fn().mockResolvedValue(true),
  }),
);
jest.unstable_mockModule(
  '../src/domains/notifications/services/sms.services.js',
  () => ({
    sendRecoverySMS: jest.fn().mockResolvedValue(true),
  }),
);

describe('Recovery Flow', () => {
  const email = 'test-recovery@example.com';
  const password = 'Password123!';

  beforeEach(async () => {
    await createUser({ email, password });
  });

  describe('POST /recovery/recoveryCode', () => {
    it('should generate a recovery code and send an email', async () => {
      const res = await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        'Código de recuperación enviado correctamente',
      );

      const user = await User.findOne({ email });
      expect(user.recoveryCode).toBeDefined();
      expect(user.recoveryCodeExpires).toBeDefined();
    });

    it('should return 200 even if user does not exist (security: no enumeration)', async () => {
      const res = await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        'Si el usuario existe, se enviará un código de recuperación',
      );
    });
  });

  describe('POST /api/recovery/verifyCode', () => {
    it('should verify code successfully', async () => {
      // First generate code (this sets required fields in DB)
      await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email });

      const user = await User.findOne({ email });
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await user.save();

      const resActual = await request(app)
        .post('/api/recovery/verifyCode')
        .send({ method: 'email', email, code });

      expect(resActual.status).toBe(200);
      expect(resActual.body.message).toBe('Código verificado correctamente');
    });

    it('should fail with incorrect code and increment attempts', async () => {
      await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email });

      const res = await request(app)
        .post('/api/recovery/verifyCode')
        .send({ method: 'email', email, code: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.error.toLowerCase()).toBe('código inválido');

      const user = await User.findOne({ email });
      expect(user.recoveryAttempts).toBe(1);
    });

    it('should lock after too many attempts', async () => {
      const user = await User.findOne({ email });
      user.recoveryAttempts = 3; // El servicio usa user.recoveryAttempts >= 3
      user.recoveryCode = 'somehash';
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await user.save();

      const res = await request(app)
        .post('/api/recovery/verifyCode')
        .send({ method: 'email', email, code: '000000' });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe(
        'Demasiados intentos. Solicite un nuevo código',
      );
    });
  });

  describe('POST /api/recovery/reset-password', () => {
    it('should reset password successfully', async () => {
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      const user = await User.findOne({ email });
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await user.save();

      const res = await request(app).post('/api/recovery/reset-password').send({
        method: 'email',
        email,
        code,
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Contraseña actualizada correctamente');

      const updatedUser = await User.findOne({ email });
      const isMatch = await bcrypt.default.compare(
        'NewPassword123!',
        updatedUser.password,
      );
      expect(isMatch).toBe(true);
      expect(updatedUser.recoveryCode).toBeNull();
    });
    it('should reset password successfully and invalidate refresh tokens', async () => {
      // First, generate a recovery code
      await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email });

      const bcrypt = await import('bcryptjs');
      const code = '123456';
      const user = await User.findOne({ email });

      // Simulate an active session by adding a refresh token
      user.refreshTokens.push({ token: 'dummyRefreshToken123' });
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000); // 10 seconds validity
      await user.save();

      const res = await request(app).post('/api/recovery/reset-password').send({
        method: 'email',
        email,
        code,
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Contraseña actualizada correctamente');

      const updatedUser = await User.findOne({ email });
      const isMatch = await bcrypt.default.compare(
        'NewPassword123!',
        updatedUser.password,
      );
      expect(isMatch).toBe(true);
      expect(updatedUser.recoveryCode).toBeNull();
      // Crucial: check if refresh tokens are invalidated
      expect(updatedUser.refreshTokens).toEqual([]);
    });
  });
});
