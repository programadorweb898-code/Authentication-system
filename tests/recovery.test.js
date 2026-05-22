import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.models.js';
import { createUser } from './factories/user.factory.js';
import { jest } from '@jest/globals';

// Mock notification services
jest.unstable_mockModule('../src/notifications/email.services.js', () => ({
  sendRecoveryEmail: jest.fn().mockResolvedValue(true),
}));
jest.unstable_mockModule('../src/notifications/sms.services.js', () => ({
  sendRecoverySMS: jest.fn().mockResolvedValue(true),
}));

describe('Recovery Flow', () => {
  let testUser;
  const email = 'test-recovery@example.com';
  const password = 'Password123!';

  beforeEach(async () => {
    testUser = await createUser({ email, password });
  });

  describe('POST /recovery/recoveryCode', () => {
    it('should generate a recovery code and send an email', async () => {
      const res = await request(app)
        .post('/recovery/recoveryCode')
        .send({ method: 'email', email });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Enlace de recuperación enviado correctamente');

      const user = await User.findOne({ email });
      expect(user.recoveryCode).toBeDefined();
      expect(user.recoveryCodeExpires).toBeDefined();
    });

    it('should return 200 even if user does not exist (security: no enumeration)', async () => {
      const res = await request(app)
        .post('/recovery/recoveryCode')
        .send({ method: 'email', email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('si existe el usuario,se envia un email');
    });
  });

  describe('POST /recovery/verifyCode', () => {
    it('should verify code successfully', async () => {
      // First generate code (this sets required fields in DB)
      await request(app).post('/recovery/recoveryCode').send({ method: 'email', email });
      
      const user = await User.findOne({ email });
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await user.save();

      const res = await request(app)
        .post('/verifyCode') // Wait, the route is /recovery/verifyCode in app.js? No, it's app.use('/recovery', reset)
        .send({ method: 'email', email, code });
      
      // Let me check the route again... it's in recovery.routes.js: router.post('/verifyCode', ...)
      // and in app.js: app.use('/recovery', reset); 
      // So the test path should be /recovery/verifyCode.
      
      const resActual = await request(app)
        .post('/recovery/verifyCode')
        .send({ method: 'email', email, code });

      expect(resActual.status).toBe(200);
      expect(resActual.body.message.message).toBe('Código verificado correctamente');
    });

    it('should fail with incorrect code and increment attempts', async () => {
       await request(app).post('/recovery/recoveryCode').send({ method: 'email', email });
       
       const res = await request(app)
        .post('/recovery/verifyCode')
        .send({ method: 'email', email, code: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.error.toLowerCase()).toBe('código invalido');

      const user = await User.findOne({ email });
      expect(user.recoveryAttempts).toBe(1);
    });

    it('should lock after too many attempts', async () => {
      const user = await User.findOne({ email });
      user.recoveryAttempts = 2;
      user.recoveryCode = 'somehash';
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await user.save();

      const res = await request(app)
        .post('/recovery/verifyCode')
        .send({ method: 'email', email, code: '000000' });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe('Demasiados intentos');
    });
  });

  describe('POST /recovery/reset-password', () => {
    it('should reset password successfully', async () => {
      const bcrypt = await import('bcryptjs');
      const code = '123456';
      const user = await User.findOne({ email });
      user.recoveryCode = await bcrypt.default.hash(code, 10);
      user.recoveryCodeExpires = new Date(Date.now() + 10000);
      await user.save();

      const res = await request(app)
        .post('/recovery/reset-password')
        .send({ 
          method: 'email', 
          email, 
          code, 
          newPassword: 'NewPassword123!' 
        });

      expect(res.status).toBe(200);
      expect(res.body.result.message).toBe('Contraseña actualizada correctamente');

      const updatedUser = await User.findOne({ email });
      const isMatch = await bcrypt.default.compare('NewPassword123!', updatedUser.password);
      expect(isMatch).toBe(true);
      expect(updatedUser.recoveryCode).toBeNull();
    });
  });
});
