import CartItem from '../../../../src/domains/ecommerce/models/cartItem.model.js';
import CartItemRepositoryInterface from '../../../../src/domains/ecommerce/repositories/cartItem.repository.interface.js';

class MongoCartItemRepository extends CartItemRepositoryInterface {
  async findByUser(userId) {
    return await CartItem.find({ userId }).exec();
  }

  async addItem(userId, productId, quantity) {
    let item = await CartItem.findOne({ userId, productId }).exec();
    if (item) {
      item.quantity += quantity;
      return await item.save();
    }
    return await CartItem.create({ userId, productId, quantity });
  }

  async removeItem(userId, productId) {
    const result = await CartItem.deleteOne({ userId, productId }).exec();
    return result.deletedCount > 0;
  }

  async clearCart(userId) {
    await CartItem.deleteMany({ userId }).exec();
  }
}

export default MongoCartItemRepository;
