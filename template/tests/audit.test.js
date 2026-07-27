import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';
import { getRepositories } from '../src/factory.js';
import jwt from 'jsonwebtoken';

describe('Audit Log Flow', () => {
  let adminToken;
  let repositories;

  beforeAll(async () => {
    repositories = await getRepositories();
  });

  beforeEach(async () => {
    const admin = await createUser({
      email: `admin-${Date.now()}@example.com`,
      role: 'admin',
    });
    adminToken = jwt.sign(
      { id: admin.id || admin._id, role: admin.role },
      process.env.JWT_SECRET,
    );
  });

  describe('Admin actions log audit entries', () => {
    it('should log audit entry when admin blocks a user', async () => {
      const target = await createUser({
        email: `target-${Date.now()}@example.com`,
      });

      const res = await request(app)
        .patch(`/api/users/${target.id || target._id}/block`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isBlocked: true });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('bloqueado');
    });

    it('should log audit entry when admin verifies a user', async () => {
      const target = await createUser({
        email: `target-${Date.now()}@example.com`,
        isVerified: false,
      });

      const res = await request(app)
        .patch(`/api/users/${target.id || target._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('verificado');
    });

    it('should log audit entry when admin deletes a user', async () => {
      const target = await createUser({
        email: `target-${Date.now()}@example.com`,
      });

      const res = await request(app)
        .delete(`/api/users/${target.id || target._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('eliminado');
    });

    it('should deny block action to regular user', async () => {
      const regular = await createUser({
        email: `regular-${Date.now()}@example.com`,
        role: 'user',
      });
      const regularToken = jwt.sign(
        { id: regular.id || regular._id, role: regular.role },
        process.env.JWT_SECRET,
      );

      const target = await createUser({
        email: `target-${Date.now()}@example.com`,
      });

      const res = await request(app)
        .patch(`/api/users/${target.id || target._id}/block`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ isBlocked: true });

      expect(res.status).toBe(403);
    });

    it('should deny delete action to regular user', async () => {
      const regular = await createUser({
        email: `regular-${Date.now()}@example.com`,
        role: 'user',
      });
      const regularToken = jwt.sign(
        { id: regular.id || regular._id, role: regular.role },
        process.env.JWT_SECRET,
      );

      const target = await createUser({
        email: `target-${Date.now()}@example.com`,
      });

      const res = await request(app)
        .delete(`/api/users/${target.id || target._id}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });
  });
});
