import { AppDataSource } from './data-source.js';
import { Product } from './entities/product.entity.js';
import ProductRepository from '../../../domains/ecommerce/repositories/product.repository.interface.js';

export class PostgresProductRepository extends ProductRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(Product);
  }

  async findAll({ minPrice, maxPrice, category, sortBy, sortOrder, page, limit }) {
    const queryBuilder = this.repository.createQueryBuilder('product');

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
  }

  async findOne(id) {
    return await this.repository.findOneBy({ id, isActive: true });
  }

  async findOneBy(where) {
    return await this.repository.findOneBy(where);
  }

  async create(data) {
    const product = this.repository.create(data);
    return await this.repository.save(product);
  }

  async update(id, data) {
    const product = await this.repository.findOneBy({ id });
    if (!product) return null;
    Object.assign(product, data);
    return await this.repository.save(product);
  }

  async softDelete(id) {
    const product = await this.repository.findOneBy({ id, isActive: true });
    if (!product) return null;
    product.isActive = false;
    return await this.repository.save(product);
  }
}
