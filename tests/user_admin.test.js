import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';
import jwt from 'jsonwebtoken';

describe('Admin Authorization Flow', () => {
  let adminUser;
  let adminToken;
  let regularUser;
  let regularToken;

  beforeEach(async () => {
    adminUser = await createUser({
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin', // Asumiendo que el modelo acepta el campo role
    });
    adminToken = jwt.sign({ id: adminUser.id || adminUser._id, role: adminUser.role }, process.env.JWT_SECRET);

    regularUser = await createUser({
      email: 'user@example.com',
      password: 'Password123!',
      role: 'user',
    });
    regularToken = jwt.sign({ id: regularUser.id || regularUser._id, role: regularUser.role }, process.env.JWT_SECRET);
  });

  describe('GET /api/users/stats', () => {
    it('should allow access to admin', async () => {
      const res = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should deny access to regular user', async () => {
      const res = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });

    it('should deny access to unauthenticated user', async () => {
      const res = await request(app).get('/api/users/stats');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users', () => {
    it('should allow access to admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should deny access to regular user', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });
  });
});
