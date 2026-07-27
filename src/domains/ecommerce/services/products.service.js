import { AppDataSource } from '../../../infrastructure/persistence/postgres/data-source.js';
import { Product } from '../../../infrastructure/persistence/postgres/entities/product.entity.js';

export const ProductService = {
  async findAll({ minPrice, maxPrice, category, sortBy, sortOrder, page, limit }) {
    const repository = AppDataSource.getRepository(Product);
    const queryBuilder = repository.createQueryBuilder('product');

    if (minPrice) queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice) queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    if (category) queryBuilder.andWhere('product.category = :category', { category });

    queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });

    if (sortBy) {
      queryBuilder.orderBy(`product.${sortBy}`, sortOrder === 'desc' ? 'DESC' : 'ASC');
    }

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    queryBuilder.skip((currentPage - 1) * pageSize).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async findOne(id) {
    const repository = AppDataSource.getRepository(Product);
    return await repository.findOneBy({ id, isActive: true });
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
  },

  async softDelete(id) {
    const repository = AppDataSource.getRepository(Product);
    const product = await repository.findOneBy({ id, isActive: true });
    if (!product) return null;
    product.isActive = false;
    return await repository.save(product);
  },
};
