import { getProductService, getCartService, getOrderService } from '../../../factory.js';

export const ProductController = {
  async getAll(req, res, next) {
    try {
      const { minPrice, maxPrice, category, sortBy, sortOrder, page, limit } = req.query;
      const productService = await getProductService();
      const result = await productService.findAll({
        minPrice, maxPrice, category, sortBy, sortOrder, page, limit,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req, res, next) {
    try {
      const productService = await getProductService();
      const product = await productService.findOne(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  async addToCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      const cartService = await getCartService();
      const item = await cartService.addItem(userId, productId, quantity || 1);
      res.status(201).json({ message: 'Product added to cart', item });
    } catch (error) {
      next(error);
    }
  },

  async createOrder(req, res, next) {
    try {
      const { deliveryMethod, shippingAddressId, storeId } = req.body;
      const orderService = await getOrderService();
      const order = await orderService.createOrder(req.user.id, { deliveryMethod, shippingAddressId, storeId });
      res.status(201).json({ message: 'Orden creada', order });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const productService = await getProductService();
      const product = await productService.create(req.body);
      res.status(201).json({ message: 'Producto creado', product });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const productService = await getProductService();
      const product = await productService.update(req.params.id, req.body);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ message: 'Producto actualizado', product });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const productService = await getProductService();
      const product = await productService.softDelete(req.params.id);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ message: 'Producto desactivado' });
    } catch (error) {
      next(error);
    }
  },

  async removeFromCart(req, res, next) {
    try {
      const cartService = await getCartService();
      const removed = await cartService.removeItem(req.user.id, req.params.productId);
      if (!removed) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
      next(error);
    }
  },

  async clearCart(req, res, next) {
    try {
      const cartService = await getCartService();
      await cartService.clearCart(req.user.id);
      res.json({ message: 'Carrito vaciado' });
    } catch (error) {
      next(error);
    }
  },

  async getCart(req, res, next) {
    try {
      const cartService = await getCartService();
      const items = await cartService.getCart(req.user.id);
      res.json(items);
    } catch (error) {
      next(error);
    }
  },

  async getMyOrders(req, res, next) {
    try {
      const orderService = await getOrderService();
      const orders = await orderService.findByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req, res, next) {
    try {
      const orderService = await getOrderService();
      const order = await orderService.findById(req.params.id, req.user.id);
      if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
      res.json(order);
    } catch (error) {
      next(error);
    }
  },
};
