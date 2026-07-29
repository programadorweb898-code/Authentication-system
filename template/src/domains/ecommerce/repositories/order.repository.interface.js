class OrderRepository {
  async createOrder(userId, data) {
    throw new Error('Method createOrder must be implemented');
  }

  async findByUser(userId) {
    throw new Error('Method findByUser must be implemented');
  }

  async findById(id, userId) {
    throw new Error('Method findById must be implemented');
  }
}

export default OrderRepository;
