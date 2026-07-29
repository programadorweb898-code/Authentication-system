import request from 'supertest';
import app from '../src/app.js';
import { getRepositories } from '../src/factory.js';
import { createUser } from './factories/user.factory.js';
import speakeasy from 'speakeasy';

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

      const { userRepository } = await getRepositories();
      const user = await userRepository.findByEmail(registerData.email);
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

    it('should log a security warning if user already exists', async () => {
      const logger = (await import('../src/infrastructure/logger.js')).default;
      const warnSpy = jest.spyOn(logger, 'warn');
      
      await createUser({ email: registerData.email });

      await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(warnSpy).toHaveBeenCalledWith(
        'Intento de registro con email existente',
        { email: registerData.email }
      );
      warnSpy.mockRestore();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return tokens', async () => {
      const user = await createUser({ isVerified: true });
      const logger = (await import('../src/infrastructure/logger.js')).default;
      const infoSpy = jest.spyOn(logger, 'info');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: registerData.password });

      expect(res.status).toBe(201);
      expect(infoSpy).toHaveBeenCalledWith(
        'Usuario inició sesión exitosamente',
        { userId: user.id, email: user.email }
      );
      infoSpy.mockRestore();
    });

    it('should fail with invalid credentials', async () => {
      await createUser({ email: registerData.email, isVerified: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.toLowerCase()).toContain('inválidas');
    });

    it('should log a security warning on invalid credentials', async () => {
      const logger = (await import('../src/infrastructure/logger.js')).default;
      const warnSpy = jest.spyOn(logger, 'warn');
      
      await createUser({ email: 'logtest@example.com', isVerified: true });

      await request(app)
        .post('/api/auth/login')
        .send({ email: 'logtest@example.com', password: 'WrongPassword' });

      expect(warnSpy).toHaveBeenCalledWith(
        'Intento fallido de inicio de sesión',
        expect.objectContaining({ email: 'logtest@example.com' })
      );
      warnSpy.mockRestore();
    });

    it('should require MFA if enabled', async () => {
      const user = await createUser({ isVerified: true, is2FAEnabled: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: registerData.password });

      expect(res.status).toBe(200);
      expect(res.body.mfaRequired).toBe(true);
      expect(res.body).toHaveProperty('mfaToken');
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

      const { userRepository } = await getRepositories();
      const updatedUser = await userRepository.findById(user.id || user._id);
      expect(updatedUser.refreshTokens).toEqual([]);

      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: 'NewPassword123!' });

      expect(newLoginRes.status).toBe(201);
    });

    it('should log a security warning if current password is incorrect', async () => {
      const logger = (await import('../src/infrastructure/logger.js')).default;
      const warnSpy = jest.spyOn(logger, 'warn');
      await createUser({ isVerified: true, email: registerData.email });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: registerData.email, password: registerData.password });

      const { accessToken } = loginRes.body;

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword123!',
          confirmNewPassword: 'NewPassword123!',
        });

      expect(warnSpy).toHaveBeenCalledWith(
        'Intento fallido de cambio de contraseña',
        expect.objectContaining({})
      );
      warnSpy.mockRestore();
    });
  });

  describe('MFA Flow', () => {
    let user;
    let accessToken;

    beforeEach(async () => {
      user = await createUser({ isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'Password123!' });
      accessToken = loginRes.body.accessToken;
    });

    describe('POST /api/auth/2fa/setup', () => {
      it('should return TOTP secret for app type', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('secret');
        expect(res.body).toHaveProperty('qrCodeUrl');
        expect(res.body.secret).toBeTruthy();
        expect(res.body.qrCodeUrl).toContain('otpauth://');
      });

      it('should return success for sms type', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'sms' });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('SMS');
      });

      it('should fail when MFA is already enabled', async () => {
        await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const res = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        expect(res.status).toBe(400);
      });

      it('should fail with invalid type', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'invalid' });

        expect(res.status).toBe(400);
      });

      it('should fail without authentication', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/setup')
          .send({ type: 'app' });

        expect(res.status).toBe(401);
      });
    });

    describe('POST /api/auth/2fa/confirm-setup', () => {
      it('should confirm setup with valid TOTP code', async () => {
        const setupRes = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const { secret } = setupRes.body;
        const totpCode = speakeasy.totp({ secret, encoding: 'base32' });

        const res = await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: totpCode });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('habilitado');
      });

      it('should fail with invalid TOTP code', async () => {
        await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const res = await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: '000000' });

        expect(res.status).toBe(400);
      });

      it('should fail when no setup was done first', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: '123456' });

        expect(res.status).toBe(400);
      });

      it('should fail without authentication', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .send({ code: '123456' });

        expect(res.status).toBe(401);
      });
    });

    describe('POST /api/auth/login with TOTP MFA', () => {
      it('should require MFA when TOTP is enabled and verified', async () => {
        const setupRes = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const totpCode = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });

        await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: totpCode });

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: user.email, password: 'Password123!' });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.mfaRequired).toBe(true);
        expect(loginRes.body).toHaveProperty('mfaToken');
      });

      it('should complete login with valid TOTP code via verify endpoint', async () => {
        const setupRes = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const totpCode = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });

        await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: totpCode });

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: user.email, password: 'Password123!' });

        const { mfaToken } = loginRes.body;

        const totpCode2 = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });

        const verifyRes = await request(app)
          .post('/api/auth/2fa/verify')
          .send({ mfaToken, code: totpCode2 });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body).toHaveProperty('accessToken');
        expect(verifyRes.body).toHaveProperty('refreshToken');
      });

      it('should fail login with invalid TOTP code', async () => {
        const setupRes = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const totpCode = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });

        await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: totpCode });

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: user.email, password: 'Password123!' });

        const { mfaToken } = loginRes.body;

        const verifyRes = await request(app)
          .post('/api/auth/2fa/verify')
          .send({ mfaToken, code: '000000' });

        expect(verifyRes.status).toBe(401);
      });
    });

    describe('POST /api/auth/2fa/disable', () => {
      it('should disable MFA with correct password', async () => {
        const setupRes = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const totpCode = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });

        await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: totpCode });

        const res = await request(app)
          .post('/api/auth/2fa/disable')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ password: 'Password123!' });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('deshabilitado');
      });

      it('should fail with incorrect password', async () => {
        const setupRes = await request(app)
          .post('/api/auth/2fa/setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'app' });

        const totpCode = speakeasy.totp({ secret: setupRes.body.secret, encoding: 'base32' });

        await request(app)
          .post('/api/auth/2fa/confirm-setup')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: totpCode });

        const res = await request(app)
          .post('/api/auth/2fa/disable')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ password: 'WrongPassword!' });

        expect(res.status).toBe(401);
      });

      it('should fail when MFA is not enabled', async () => {
        const res = await request(app)
          .post('/api/auth/2fa/disable')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ password: 'Password123!' });

        expect(res.status).toBe(400);
      });
    });
  });
});
