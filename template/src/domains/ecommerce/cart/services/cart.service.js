export class CartService {
  constructor(cartItemRepository) {
    this.cartItemRepository = cartItemRepository;
  }

  async addItem(userId, productId, quantity) {
    return await this.cartItemRepository.addItem(userId, productId, quantity);
  }

  async getCart(userId) {
    return await this.cartItemRepository.findByUser(userId);
  }

  async removeItem(userId, productId) {
    return await this.cartItemRepository.removeItem(userId, productId);
  }

  async clearCart(userId) {
    await this.cartItemRepository.clearCart(userId);
  }
}
