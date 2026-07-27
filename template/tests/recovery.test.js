import request from 'supertest';
import app from '../src/app.js';
import { getRepositories } from '../src/factory.js';
import { createUser } from './factories/user.factory.js';
import { jest } from '@jest/globals';

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

      const { userRepository } = await getRepositories();
      const user = await userRepository.findByEmail(email);
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
      await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email });

      const { userRepository } = await getRepositories();
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      const user = await userRepository.findByEmail(email);
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await userRepository.save(user);

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

      const { userRepository } = await getRepositories();
      const user = await userRepository.findByEmail(email);
      expect(user.recoveryAttempts).toBe(1);
    });

    it('should lock after too many attempts', async () => {
      const { userRepository } = await getRepositories();
      const bcrypt = await import('bcryptjs');
      const user = await userRepository.findByEmail(email);
      user.recoveryAttempts = 3;
      user.recoveryCode = 'somehash';
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await userRepository.save(user);

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
      const { userRepository } = await getRepositories();
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      const user = await userRepository.findByEmail(email);
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await userRepository.save(user);

      const res = await request(app).post('/api/recovery/reset-password').send({
        method: 'email',
        email,
        code,
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Contraseña actualizada correctamente');

      const updatedUser = await userRepository.findByEmail(email);
      const isMatch = await bcrypt.default.compare(
        'NewPassword123!',
        updatedUser.password,
      );
      expect(isMatch).toBe(true);
      expect(updatedUser.recoveryCode).toBeNull();
    });

    it('should reset password successfully and invalidate refresh tokens', async () => {
      await request(app)
        .post('/api/recovery/recoveryCode')
        .send({ method: 'email', email });

      const { userRepository } = await getRepositories();
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      const user = await userRepository.findByEmail(email);

      user.refreshTokens.push({ token: 'dummyRefreshToken123' });
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await userRepository.save(user);

      const res = await request(app).post('/api/recovery/reset-password').send({
        method: 'email',
        email,
        code,
        newPassword: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Contraseña actualizada correctamente');

      const updatedUser = await userRepository.findByEmail(email);
      const isMatch = await bcrypt.default.compare(
        'NewPassword123!',
        updatedUser.password,
      );
      expect(isMatch).toBe(true);
      expect(updatedUser.recoveryCode).toBeNull();
      expect(updatedUser.refreshTokens).toEqual([]);
    });
  });
});
