import { ProductService } from '../services/products.service.js';

export const ProductController = {
  async getAll(req, res) {
    try {
      const { minPrice, maxPrice, category, sortBy, sortOrder } = req.query;
      const products = await ProductService.findAll({ minPrice, maxPrice, category, sortBy, sortOrder });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  },

  async getOne(req, res) {
    try {
      const product = await ProductService.findOne(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching product' });
    }
  },

  async addToCart(req, res) {
    res.status(201).json({ message: 'Product added to cart', user: req.user.id });
  },

  async createOrder(req, res) {
    res.status(201).json({ message: 'Order created', user: req.user.id });
  }
};
