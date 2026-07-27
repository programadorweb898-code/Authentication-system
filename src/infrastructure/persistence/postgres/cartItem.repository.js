import { AppDataSource } from './data-source.js';
import { CartItem } from './entities/cartItem.entity.js';
import CartItemRepository from '../../../domains/ecommerce/repositories/cartItem.repository.interface.js';

export class PostgresCartItemRepository extends CartItemRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(CartItem);
  }

  async findByUser(userId) {
    return await this.repository.find({ where: { userId } });
  }

  async addItem(userId, productId, quantity) {
    let item = await this.repository.findOne({ where: { userId, productId } });
    if (item) {
      item.quantity += quantity;
    } else {
      item = this.repository.create({ userId, productId, quantity });
    }
    return await this.repository.save(item);
  }

  async removeItem(userId, productId) {
    const result = await this.repository.delete({ userId, productId });
    return result.affected > 0;
  }

  async clearCart(userId) {
    await this.repository.delete({ userId });
  }
}
