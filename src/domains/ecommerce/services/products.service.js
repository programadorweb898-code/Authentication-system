import { AppDataSource } from '../../../infrastructure/persistence/postgres/data-source.js';
import { Product } from '../../../infrastructure/persistence/postgres/entities/product.entity.js';

export const ProductService = {
  async findAll({ minPrice, maxPrice, category, sortBy, sortOrder }) {
    const repository = AppDataSource.getRepository(Product);
    const queryBuilder = repository.createQueryBuilder('product');

    if (minPrice) queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice) queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    if (category) queryBuilder.andWhere('product.category = :category', { category });

    if (sortBy) {
      queryBuilder.orderBy(`product.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
    }

    return await queryBuilder.getMany();
  },

  async findOne(id) {
    const repository = AppDataSource.getRepository(Product);
    return await repository.findOneBy({ id });
  },

  async create(data) {
    const repository = AppDataSource.getRepository(Product);
    const product = repository.create(data);
    return await repository.save(product);
  },

  async update(id, data) {
    const repository = AppDataSource.getRepository(Product);
    const product = await repository.findOneBy({ id });
    if (!product) return null;
    Object.assign(product, data);
    return await repository.save(product);
  }
};
