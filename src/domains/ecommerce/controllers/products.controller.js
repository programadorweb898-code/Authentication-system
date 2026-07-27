import { ProductService } from '../services/products.service.js';
import { CartService } from '../cart/services/cart.service.js';

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
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      const item = await CartService.addItem(userId, productId, quantity || 1);
      res.status(201).json({ message: 'Product added to cart', item });
    } catch (error) {
      res.status(500).json({ error: 'Error adding to cart' });
    }
  },

  async createOrder(req, res) {
    res.status(201).json({ message: 'Order created', user: req.user.id });
  }
};
