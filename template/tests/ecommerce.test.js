import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './factories/user.factory.js';
import { AppDataSource } from '../infrastructure/database/data-source.js';
import { Product } from '../infrastructure/database/entities/product.entity.js';
import { ProductImage } from '../infrastructure/database/entities/productImage.entity.js';
import { Address } from '../infrastructure/database/entities/address.entity.js';
import { Store } from '../infrastructure/database/entities/store.entity.js';
import xlsx from 'xlsx';

async function createTestProduct(overrides = {}) {
  const repository = AppDataSource.getRepository(Product);
  const product = repository.create({
    name: 'Test Product',
    price: 100,
    category: 'test',
    description: 'A test product',
    stock: 10,
    ...overrides,
  });
  return await repository.save(product);
}

async function createTestAddress(userId, overrides = {}) {
  const repository = AppDataSource.getRepository(Address);
  const address = repository.create({
    street: 'Calle Principal 123',
    city: 'Ciudad Test',
    state: 'Estado Test',
    postalCode: '12345',
    country: 'País Test',
    userId,
    ...overrides,
  });
  return await repository.save(address);
}

describe('Ecommerce Flow', () => {
  let user;
  let accessToken;
  let product;

  beforeEach(async () => {
    user = await createUser({ isVerified: true });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Password123!' });
    accessToken = loginRes.body.accessToken;
    product = await createTestProduct();
  });

  describe('POST /api/products (Admin) — Validation', () => {
    let adminToken;

    beforeEach(async () => {
      const admin = await createUser({ role: 'admin', isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: 'Password123!' });
      adminToken = loginRes.body.accessToken;
    });

    it('should return 201 with valid data', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Product', price: 50, category: 'test', description: 'desc', stock: 5 });
      expect(res.status).toBe(201);
    });

    it('should return 400 if name is empty', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', price: 50, category: 'test', description: 'desc' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if price is negative', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Product', price: -10, category: 'test', description: 'desc' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if price is not numeric', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Product', price: 'abc', category: 'test', description: 'desc' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/products/cart (Protected) — Validation', () => {
    it('should return 400 if productId is missing', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ quantity: 2 });
      expect(res.status).toBe(400);
    });

    it('should return 400 if quantity is negative', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: -1 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    it('should return a paginated list of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(typeof res.body.page).toBe('number');
      expect(typeof res.body.totalPages).toBe('number');
    });

    it('should paginate with default limit of 20', async () => {
      const repo = AppDataSource.getRepository(Product);
      for (let i = 0; i < 24; i++) {
        const p = repo.create({ name: `Bulk ${i}`, price: 10, category: 'pagination', description: 'x', stock: 1 });
        await repo.save(p);
      }

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(20);
      expect(res.body.total).toBeGreaterThanOrEqual(25);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(2);
      expect(res.body.page).toBe(1);
    });

    it('should return page 2 with remaining products', async () => {
      const repo = AppDataSource.getRepository(Product);
      for (let i = 0; i < 24; i++) {
        const p = repo.create({ name: `Bulk ${i}`, price: 10, category: 'pagination', description: 'x', stock: 1 });
        await repo.save(p);
      }

      const res = await request(app).get('/api/products?page=2&limit=20');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      expect(res.body.page).toBe(2);
    });

    it('should cap limit at 100', async () => {
      const res = await request(app).get('/api/products?limit=500');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(100);
    });

    it('should still work with category filter and pagination', async () => {
      await createTestProduct({ category: 'filter-test', price: 50 });
      await createTestProduct({ category: 'filter-test', price: 60 });

      const res = await request(app).get('/api/products?category=filter-test');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(2);
    });

    it('should still work with price range and sort', async () => {
      await createTestProduct({ price: 5 });
      await createTestProduct({ price: 15 });
      await createTestProduct({ price: 25 });

      const res = await request(app).get('/api/products?minPrice=10&maxPrice=30&sortBy=price&sortOrder=asc');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(Number(res.body.data[0].price)).toBeGreaterThanOrEqual(10);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by ID', async () => {
      const res = await request(app).get(`/api/products/${product.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Product');
    });

    it('should return 404 if product not found', async () => {
      const res = await request(app).get('/api/products/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products/cart (Protected)', () => {
    it('should add a product to the cart with valid token', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 2 });

      expect(res.status).toBe(201);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .send({ productId: product.id, quantity: 2 });

      expect(res.status).toBe(401);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .post('/api/products/cart')
        .set('Authorization', 'Bearer invalid_token')
        .send({ productId: product.id, quantity: 2 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products/cart (Protected)', () => {
    it('should return cart items', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 2 });

      const res = await request(app)
        .get('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/products/cart');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/products/orders (Protected) — Order creation', () => {
    let addressId;

    beforeEach(async () => {
      const address = await createTestAddress(user.id);
      addressId = address.id;
    });

    it('should create an order from cart and deduct stock', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 3 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping', shippingAddressId: addressId });

      expect(res.status).toBe(201);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.status).toBe('pending');
      expect(Number(res.body.order.total)).toBe(300);
      expect(res.body.order.items).toHaveLength(1);
      expect(res.body.order.items[0].quantity).toBe(3);
      expect(res.body.order.shippingAddressId).toBe(addressId);

      const updatedProduct = await AppDataSource.getRepository(Product).findOneBy({ id: product.id });
      expect(updatedProduct.stock).toBe(7);

      const cartAfter = await request(app)
        .get('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(cartAfter.body.length).toBe(0);
    });

    it('should return 400 if cart is empty', async () => {
      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping', shippingAddressId: addressId });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('vacío');
    });

    it('should return 400 if stock is insufficient', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 999 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping', shippingAddressId: addressId });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Stock insuficiente');
    });

    it('should return 400 if deliveryMethod is missing', async () => {
      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });

    it('should return 400 if shippingAddressId is missing when shipping', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping' });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });

    it('should return 400 if shippingAddressId does not exist', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping', shippingAddressId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Dirección de envío no encontrada');
    });

    it('should return 400 if shippingAddressId belongs to another user', async () => {
      const otherUser = await createUser({ isVerified: true });
      const otherAddress = await createTestAddress(otherUser.id);

      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping', shippingAddressId: otherAddress.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Dirección de envío no encontrada');
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).post('/api/products/orders').send({ shippingAddressId: addressId });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products/orders (Protected)', () => {
    let addressId;

    beforeEach(async () => {
      const address = await createTestAddress(user.id);
      addressId = address.id;
    });

    it('should return user orders', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'shipping', shippingAddressId: addressId });

      const res = await request(app)
        .get('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/products/orders');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/products/cart/:productId (Protected)', () => {
    it('should remove a product from cart', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .delete(`/api/products/cart/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('eliminado');
    });

    it('should return 404 if product not in cart', async () => {
      const res = await request(app)
        .delete('/api/products/cart/999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).delete('/api/products/cart/1');
      expect(res.status).toBe(401);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .delete('/api/products/cart/1')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/products/:id (Admin) — Soft delete', () => {
    let adminToken;

    beforeEach(async () => {
      const admin = await createUser({ role: 'admin', isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: 'Password123!' });
      adminToken = loginRes.body.accessToken;
    });

    it('should soft-delete a product (200)', async () => {
      const res = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('desactivado');
    });

    it('should not return soft-deleted product in GET /api/products', async () => {
      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app).get('/api/products');
      const ids = res.body.data.map(p => p.id);
      expect(ids).not.toContain(product.id);
    });

    it('should return 404 when fetching soft-deleted product by ID', async () => {
      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app).get(`/api/products/${product.id}`);
      expect(res.status).toBe(404);
    });

    it('should return 403 for regular user (no product:write)', async () => {
      const res = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 404 when soft-deleting non-existent product', async () => {
      const res = await request(app)
        .delete('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should keep the row in the database after soft-delete', async () => {
      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const repo = AppDataSource.getRepository(Product);
      const row = await repo.findOneBy({ id: product.id });
      expect(row).not.toBeNull();
      expect(row.isActive).toBe(false);
    });
  });

  describe('DELETE /api/products/cart (Protected)', () => {
    it('should clear the cart', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 2 });

      const res = await request(app)
        .delete('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('vaciado');
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).delete('/api/products/cart');
      expect(res.status).toBe(401);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .delete('/api/products/cart')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
    });
  });

  describe('Addresses — CRUD', () => {
    it('should create an address (201)', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          street: 'Av. Siempre Viva 742',
          city: 'Springfield',
          state: 'Estado Test',
          postalCode: '54321',
          country: 'País Test',
        });

      expect(res.status).toBe(201);
      expect(res.body.address).toBeDefined();
      expect(res.body.address.street).toBe('Av. Siempre Viva 742');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should get all addresses for the user', async () => {
      await createTestAddress(user.id);
      await createTestAddress(user.id, { street: 'Otra Calle 456' });

      const res = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should update an address', async () => {
      const address = await createTestAddress(user.id);

      const res = await request(app)
        .patch(`/api/addresses/${address.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ street: 'Calle Actualizada 999' });

      expect(res.status).toBe(200);
      expect(res.body.address.street).toBe('Calle Actualizada 999');
    });

    it('should return 404 when updating another user\'s address', async () => {
      const otherUser = await createUser({ isVerified: true });
      const otherAddress = await createTestAddress(otherUser.id);

      const res = await request(app)
        .patch(`/api/addresses/${otherAddress.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ street: 'Hacked' });

      expect(res.status).toBe(404);
    });

    it('should delete an address', async () => {
      const address = await createTestAddress(user.id);

      const res = await request(app)
        .delete(`/api/addresses/${address.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('eliminada');
    });

    it('should return 404 when deleting another user\'s address', async () => {
      const otherUser = await createUser({ isVerified: true });
      const otherAddress = await createTestAddress(otherUser.id);

      const res = await request(app)
        .delete(`/api/addresses/${otherAddress.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should set isDefault: false on previous addresses when creating new default', async () => {
      const addr1 = await createTestAddress(user.id, { isDefault: true });
      expect(addr1.isDefault).toBe(true);

      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          street: 'Nueva Default',
          city: 'Ciudad',
          state: 'Estado',
          postalCode: '11111',
          country: 'País',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.address.isDefault).toBe(true);

      const updatedOld = await AppDataSource.getRepository(Address).findOneBy({ id: addr1.id });
      expect(updatedOld.isDefault).toBe(false);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/addresses');
      expect(res.status).toBe(401);
    });
  });

  describe('Store management (Admin)', () => {
    let adminToken;

    beforeEach(async () => {
      const admin = await createUser({ role: 'admin', isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: 'Password123!' });
      adminToken = loginRes.body.accessToken;
    });

    it('should create a store (201)', async () => {
      const res = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Tienda Centro', address: 'Av. Principal 123', city: 'Ciudad' });
      expect(res.status).toBe(201);
      expect(res.body.store.name).toBe('Tienda Centro');
    });

    it('should list all stores', async () => {
      await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sucursal 1', address: 'Dir 1', city: 'C1' });
      await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sucursal 2', address: 'Dir 2', city: 'C2' });

      const res = await request(app).get('/api/stores');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 403 for regular user on create', async () => {
      const res = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Tienda', address: 'Dir', city: 'C' });
      expect(res.status).toBe(403);
    });

    it('should delete a store', async () => {
      const createRes = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Para borrar', address: 'Dir', city: 'C' });

      const res = await request(app)
        .delete(`/api/stores/${createRes.body.store.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('eliminado');
    });
  });

  describe('POST /api/products/orders — Pickup delivery', () => {
    let adminToken;
    let storeId;

    beforeEach(async () => {
      const admin = await createUser({ role: 'admin', isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: 'Password123!' });
      adminToken = loginRes.body.accessToken;

      const storeRes = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Tienda Centro', address: 'Av. Principal 123', city: 'Ciudad' });
      storeId = storeRes.body.store.id;
    });

    it('should create an order with pickup delivery', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 2 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'pickup', storeId });

      expect(res.status).toBe(201);
      expect(res.body.order.deliveryMethod).toBe('pickup');
      expect(res.body.order.storeId).toBe(storeId);
      expect(res.body.order.shippingAddressId).toBeNull();
    });

    it('should return 400 if storeId is missing for pickup', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'pickup' });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });

    it('should return 400 if store is not available for pickup', async () => {
      await request(app)
        .post('/api/products/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .post('/api/products/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deliveryMethod: 'pickup', storeId: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Local de retiro no disponible');
    });
  });

  describe('GET /api/stores/pickup', () => {
    let adminToken;

    beforeEach(async () => {
      const admin = await createUser({ role: 'admin', isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: 'Password123!' });
      adminToken = loginRes.body.accessToken;
    });

    it('should return only stores with pickup available', async () => {
      await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Con Pickup', address: 'Dir 1', city: 'C1', isPickupAvailable: true });
      await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Solo Envío', address: 'Dir 2', city: 'C2', isPickupAvailable: false });

      const res = await request(app).get('/api/stores/pickup');
      expect(res.status).toBe(200);
      expect(res.body.every(s => s.isPickupAvailable)).toBe(true);
    });
  });

  describe('Product Images Gallery', () => {
    let adminToken;

    beforeEach(async () => {
      const admin = await createUser({ role: 'admin', isVerified: true });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: 'Password123!' });
      adminToken = loginRes.body.accessToken;

      const repo = AppDataSource.getRepository(ProductImage);
      await repo.delete({ productId: product.id });
    });

    it('should add a single link and set it as main (201)', async () => {
      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/img1.jpg'] });

      expect(res.status).toBe(201);
      expect(res.body.images).toHaveLength(1);
      expect(res.body.images[0].isMain).toBe(true);

      const updatedProduct = await AppDataSource.getRepository(Product).findOneBy({ id: product.id });
      expect(updatedProduct.imageUrl).toBe('https://example.com/img1.jpg');
    });

    it('should add a list of 3 links at once', async () => {
      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: [
          'https://example.com/a.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
        ]});

      expect(res.status).toBe(201);
      expect(res.body.images).toHaveLength(3);
    });

    it('should return 400 when exceeding 5 images', async () => {
      const repo = AppDataSource.getRepository(ProductImage);
      const images = Array.from({ length: 5 }, (_, i) =>
        repo.create({ productId: product.id, url: `https://example.com/${i}.jpg` })
      );
      await repo.save(images);

      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/new.jpg'] });

      expect(res.status).toBe(400);
    });

    it('should not create duplicate rows for repeated URLs', async () => {
      await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/dup.jpg'] });

      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/dup.jpg'] });

      expect(res.status).toBe(201);
      expect(res.body.images).toHaveLength(0);
    });

    it('should return 400 for invalid URLs', async () => {
      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['not-a-valid-url'] });

      expect(res.status).toBe(400);
    });

    it('should return 404 when adding images to non-existent product', async () => {
      const res = await request(app)
        .post('/api/products/999999/images')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/img.jpg'] });

      expect(res.status).toBe(404);
    });

    it('should list images for a product', async () => {
      await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/a.jpg', 'https://example.com/b.jpg'] });

      const res = await request(app).get(`/api/products/${product.id}/images`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should auto-assign new main when current main is deleted and update Product.imageUrl', async () => {
      const addRes = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/main.jpg', 'https://example.com/second.jpg'] });

      const mainId = addRes.body.images[0].id;
      const secondId = addRes.body.images[1].id;

      expect(addRes.body.images[0].isMain).toBe(true);

      const delRes = await request(app)
        .delete(`/api/products/${product.id}/images/${mainId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(delRes.status).toBe(200);

      const updatedProduct = await AppDataSource.getRepository(Product).findOneBy({ id: product.id });
      expect(updatedProduct.imageUrl).toBe('https://example.com/second.jpg');

      const remaining = await AppDataSource.getRepository(ProductImage).findOneBy({ id: secondId });
      expect(remaining.isMain).toBe(true);
    });

    it('should mark a specific image as main and update Product.imageUrl', async () => {
      const addRes = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ urls: ['https://example.com/first.jpg', 'https://example.com/second.jpg'] });

      const secondId = addRes.body.images[1].id;

      const res = await request(app)
        .patch(`/api/products/${product.id}/images/${secondId}/main`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.image.id).toBe(secondId);
      expect(res.body.image.isMain).toBe(true);

      const updatedProduct = await AppDataSource.getRepository(Product).findOneBy({ id: product.id });
      expect(updatedProduct.imageUrl).toBe('https://example.com/second.jpg');
    });

    it('should extract URLs from an uploaded .xlsx file', async () => {
      const workbook = xlsx.utils.book_new();
      const wsData = [
        ['https://example.com/xls1.jpg', 'some text', 'https://example.com/xls2.jpg'],
        ['no url here', 'https://example.com/xls3.jpg'],
      ];
      const ws = xlsx.utils.aoa_to_sheet(wsData);
      xlsx.utils.book_append_sheet(workbook, ws, 'Sheet1');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const res = await request(app)
        .post(`/api/products/${product.id}/images/upload`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', buffer, 'test.xlsx');

      expect(res.status).toBe(201);
      expect(res.body.images).toHaveLength(3);
    });

    it('should return 400 for unsupported file type', async () => {
      const res = await request(app)
        .post(`/api/products/${product.id}/images/upload`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('this is not an image'), 'test.txt');

      expect(res.status).toBe(400);
    });

    it('should return 403 for regular user without product:write', async () => {
      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ urls: ['https://example.com/img.jpg'] });

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post(`/api/products/${product.id}/images`)
        .send({ urls: ['https://example.com/img.jpg'] });

      expect(res.status).toBe(401);
    });
  });
});
