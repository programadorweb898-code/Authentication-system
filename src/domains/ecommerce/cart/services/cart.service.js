import { getRepository } from 'typeorm';
import { CartItem } from '../../../../infrastructure/persistence/postgres/entities/cartItem.entity.js';

export const CartService = {
  async addItem(userId, productId, quantity) {
    const repository = getRepository(CartItem);
    let item = await repository.findOne({ where: { userId, productId } });
    if (item) {
      item.quantity += quantity;
    } else {
      item = repository.create({ userId, productId, quantity });
    }
    return await repository.save(item);
  },

  async getCart(userId) {
    const repository = getRepository(CartItem);
    return await repository.find({ where: { userId } });
  }
};
