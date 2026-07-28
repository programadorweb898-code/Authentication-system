import Product from '../../../../src/domains/ecommerce/models/product.model.js';
import ProductRepositoryInterface from '../../../../src/domains/ecommerce/repositories/product.repository.interface.js';

class MongoProductRepository extends ProductRepositoryInterface {
  async findAll({ minPrice, maxPrice, category, sortBy, sortOrder, page, limit }) {
    const filter = { isActive: true };
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (category) filter.category = category;

    const sort = {};
    if (sortBy) sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [data, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((currentPage - 1) * pageSize).limit(pageSize).exec(),
      Product.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id) {
    return await Product.findOne({ _id: id, isActive: true }).exec();
  }

  async findOneBy(where) {
    return await Product.findOne(where).exec();
  }

  async create(data) {
    return await Product.create(data);
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async softDelete(id) {
    const product = await Product.findOne({ _id: id, isActive: true }).exec();
    if (!product) return null;
    product.isActive = false;
    return await product.save();
  }
}

export default MongoProductRepository;
