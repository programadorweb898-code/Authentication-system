export class OrderService {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async createOrder(userId, data) {
    return await this.orderRepository.createOrder(userId, data);
  }

  async findByUser(userId) {
    return await this.orderRepository.findByUser(userId);
  }

  async findById(id, userId) {
    return await this.orderRepository.findById(id, userId);
  }
}
