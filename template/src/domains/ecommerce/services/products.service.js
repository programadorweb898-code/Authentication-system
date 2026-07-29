export class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async findAll(filters) {
    return await this.productRepository.findAll(filters);
  }

  async findOne(id) {
    return await this.productRepository.findOne(id);
  }

  async create(data) {
    return await this.productRepository.create(data);
  }

  async update(id, data) {
    return await this.productRepository.update(id, data);
  }

  async softDelete(id) {
    return await this.productRepository.softDelete(id);
  }
}
