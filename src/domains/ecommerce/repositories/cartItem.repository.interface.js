class CartItemRepository {
  async findByUser(userId) {
    throw new Error('Method findByUser must be implemented');
  }

  async addItem(userId, productId, quantity) {
    throw new Error('Method addItem must be implemented');
  }

  async removeItem(userId, productId) {
    throw new Error('Method removeItem must be implemented');
  }

  async clearCart(userId) {
    throw new Error('Method clearCart must be implemented');
  }
}

export default CartItemRepository;
