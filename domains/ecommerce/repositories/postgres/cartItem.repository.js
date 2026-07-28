import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { CartItem } from '../../../../infrastructure/database/entities/cartItem.entity.js';
import CartItemRepositoryInterface from '../../../../src/domains/ecommerce/repositories/cartItem.repository.interface.js';

export class PostgresCartItemRepository extends CartItemRepositoryInterface {
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
