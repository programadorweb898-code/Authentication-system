class ProductRepository {
  async findAll(filters) {
    throw new Error('Method findAll must be implemented');
  }

  async findOne(id) {
    throw new Error('Method findOne must be implemented');
  }

  async findOneBy(where) {
    throw new Error('Method findOneBy must be implemented');
  }

  async create(data) {
    throw new Error('Method create must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update must be implemented');
  }

  async softDelete(id) {
    throw new Error('Method softDelete must be implemented');
  }
}

export default ProductRepository;
