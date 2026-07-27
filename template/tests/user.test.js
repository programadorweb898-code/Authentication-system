import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';
import jwt from 'jsonwebtoken';

describe('User Profile Flow', () => {
  let testUser;
  let token;

  beforeEach(async () => {
    testUser = await createUser({
      email: 'user@example.com',
      password: 'Password123!',
    });
    token = jwt.sign({ id: testUser.id || testUser._id }, process.env.JWT_SECRET);
  });

  describe('GET /api/users/me', () => {
    it('should return user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'user@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '123456789' });

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('phone', '123456789');
    });
  });
});
