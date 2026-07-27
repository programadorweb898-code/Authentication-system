import { AppDataSource } from '../../../../infrastructure/persistence/postgres/data-source.js';
import { CartItem } from '../../../../infrastructure/persistence/postgres/entities/cartItem.entity.js';

export const CartService = {
  async addItem(userId, productId, quantity) {
    const repository = AppDataSource.getRepository(CartItem);
    let item = await repository.findOne({ where: { userId, productId } });
    if (item) {
      item.quantity += quantity;
    } else {
      item = repository.create({ userId, productId, quantity });
    }
    return await repository.save(item);
  },

  async getCart(userId) {
    const repository = AppDataSource.getRepository(CartItem);
    return await repository.find({ where: { userId } });
  },

  async removeItem(userId, productId) {
    const repository = AppDataSource.getRepository(CartItem);
    const result = await repository.delete({ userId, productId });
    return result.affected > 0;
  },

  async clearCart(userId) {
    const repository = AppDataSource.getRepository(CartItem);
    await repository.delete({ userId });
  }
};
