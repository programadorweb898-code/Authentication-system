import { getRepository } from 'typeorm';
import { Product } from '../../../infrastructure/persistence/postgres/entities/product.entity.js';

export const ProductService = {
  async findAll({ minPrice, maxPrice, category, sortBy, sortOrder }) {
    const repository = getRepository(Product);
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
    const repository = getRepository(Product);
    return await repository.findOneBy({ id });
  }
};
