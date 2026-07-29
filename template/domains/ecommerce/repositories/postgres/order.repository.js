import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { Order } from '../../../../infrastructure/database/entities/order.entity.js';
import { OrderItem } from '../../../../infrastructure/database/entities/orderItem.entity.js';
import { Product } from '../../../../infrastructure/database/entities/product.entity.js';
import { CartItem } from '../../../../infrastructure/database/entities/cartItem.entity.js';
import { Address } from '../../../../infrastructure/database/entities/address.entity.js';
import { Store } from '../../../../infrastructure/database/entities/store.entity.js';
import OrderRepositoryInterface from '../../../../src/domains/ecommerce/repositories/order.repository.interface.js';

export class PostgresOrderRepository extends OrderRepositoryInterface {
  constructor() {
    super();
  }

  async createOrder(userId, { deliveryMethod, shippingAddressId, storeId }) {
    return await AppDataSource.transaction(async (manager) => {
      if (deliveryMethod === 'shipping') {
        if (!shippingAddressId) {
          const error = new Error('La dirección de envío es requerida');
          error.statusCode = 400;
          throw error;
        }
        const address = await manager.findOneBy(Address, { id: shippingAddressId, userId });
        if (!address) {
          const error = new Error('Dirección de envío no encontrada');
          error.statusCode = 400;
          throw error;
        }
      }

      if (deliveryMethod === 'pickup') {
        if (!storeId) {
          const error = new Error('El local de retiro es requerido');
          error.statusCode = 400;
          throw error;
        }
        const store = await manager.findOneBy(Store, { id: storeId, isActive: true, isPickupAvailable: true });
        if (!store) {
          const error = new Error('Local de retiro no disponible');
          error.statusCode = 400;
          throw error;
        }
      }

      const cartItems = await manager.find(CartItem, { where: { userId } });

      if (cartItems.length === 0) {
        const error = new Error('El carrito está vacío');
        error.statusCode = 400;
        throw error;
      }

      let total = 0;
      const orderItems = [];

      for (const cartItem of cartItems) {
        const product = await manager.findOneBy(Product, { id: cartItem.productId });

        if (!product) {
          const error = new Error(`Producto ${cartItem.productId} no encontrado`);
          error.statusCode = 400;
          throw error;
        }

        if (product.stock < cartItem.quantity) {
          const error = new Error(`Stock insuficiente para ${product.name}`);
          error.statusCode = 400;
          throw error;
        }

        product.stock -= cartItem.quantity;
        await manager.save(Product, product);

        const orderItem = manager.create(OrderItem, {
          productId: product.id,
          quantity: cartItem.quantity,
          priceAtPurchase: product.price,
        });
        orderItems.push(orderItem);
        total += Number(product.price) * cartItem.quantity;
      }

      const order = manager.create(Order, {
        userId,
        status: 'pending',
        total,
        items: orderItems,
        deliveryMethod,
        storeId: deliveryMethod === 'pickup' ? storeId : null,
        shippingAddressId: deliveryMethod === 'shipping' ? shippingAddressId : null,
      });

      const savedOrder = await manager.save(Order, order);
      await manager.delete(CartItem, { userId });

      return savedOrder;
    });
  }

  async findByUser(userId) {
    const repository = AppDataSource.getRepository(Order);
    return await repository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findById(id, userId) {
    const repository = AppDataSource.getRepository(Order);
    return await repository.findOne({ where: { id, userId } });
  }
}
