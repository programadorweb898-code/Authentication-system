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
  }
};
