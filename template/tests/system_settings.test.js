import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';
import { getSystemSettingsService } from '../src/factory.js';
import jwt from 'jsonwebtoken';

describe('System Settings Flow', () => {
  let adminToken;
  let regularToken;

  const resetSettings = async () => {
    const service = await getSystemSettingsService();
    await service.updateSettings({
      maintenanceMode: false,
      loginRateLimit: 20,
    });
  };

  beforeEach(async () => {
    const admin = await createUser({
      email: `admin-${Date.now()}@example.com`,
      role: 'admin',
    });
    adminToken = jwt.sign(
      { id: admin.id || admin._id, role: admin.role },
      process.env.JWT_SECRET,
    );

    const regular = await createUser({
      email: `user-${Date.now()}@example.com`,
      role: 'user',
    });
    regularToken = jwt.sign(
      { id: regular.id || regular._id, role: regular.role },
      process.env.JWT_SECRET,
    );

    await resetSettings();
  });

  describe('GET /api/admin/settings', () => {
    it('should return settings for admin', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('maintenanceMode');
      expect(res.body).toHaveProperty('loginRateLimit');
    });

    it('should allow access to regular user (USER_READ)', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(200);
    });

    it('should deny access without authentication', async () => {
      const res = await request(app).get('/api/admin/settings');

      expect(res.status).toBe(401);
    });

    it('should deny access with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/admin/settings', () => {
    it('should update settings for admin', async () => {
      const res = await request(app)
        .patch('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ loginRateLimit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('actualizada');
      expect(res.body.settings.loginRateLimit).toBe(10);
    });

    it('should deny update to regular user (no USER_WRITE)', async () => {
      const res = await request(app)
        .patch('/api/admin/settings')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ loginRateLimit: 5 });

      expect(res.status).toBe(403);
    });

    it('should deny update without authentication', async () => {
      const res = await request(app)
        .patch('/api/admin/settings')
        .send({ loginRateLimit: 5 });

      expect(res.status).toBe(401);
    });

    it('should reflect updated settings on subsequent get', async () => {
      await request(app)
        .patch('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ loginRateLimit: 5, maintenanceMode: false });

      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.loginRateLimit).toBe(5);
    });

    it('should enable and disable maintenance mode', async () => {
      const enableRes = await request(app)
        .patch('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ maintenanceMode: true });

      expect(enableRes.status).toBe(200);

      const blockedRes = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(blockedRes.status).toBe(503);

      await resetSettings();

      const afterReset = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(afterReset.status).toBe(200);
    });
  });
});
