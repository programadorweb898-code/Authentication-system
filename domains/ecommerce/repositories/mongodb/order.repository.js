import Order from '../../../../src/domains/ecommerce/models/order.model.js';
import Product from '../../../../src/domains/ecommerce/models/product.model.js';
import CartItem from '../../../../src/domains/ecommerce/models/cartItem.model.js';
import OrderRepositoryInterface from '../../../../src/domains/ecommerce/repositories/order.repository.interface.js';

class MongoOrderRepository extends OrderRepositoryInterface {
  async createOrder(userId, { deliveryMethod, shippingAddressId, storeId }) {
    const cartItems = await CartItem.find({ userId }).exec();

    if (cartItems.length === 0) {
      const error = new Error('El carrito está vacío');
      error.statusCode = 400;
      throw error;
    }

    let total = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.productId).exec();

      if (!product) {
        const error = new Error(`Producto ${cartItem.productId} no encontrado`);
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < cartItem.quantity) {
        const error = new Error(`Stock insuficiente para ${product.name}`);
        error.statusCode = 400;
        throw error;
      }

      product.stock -= cartItem.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        quantity: cartItem.quantity,
        priceAtPurchase: product.price,
      });
      total += Number(product.price) * cartItem.quantity;
    }

    const order = await Order.create({
      userId,
      status: 'pending',
      total,
      items: orderItems,
      deliveryMethod,
      storeId: deliveryMethod === 'pickup' ? storeId : null,
      shippingAddressId: deliveryMethod === 'shipping' ? shippingAddressId : null,
    });

    await CartItem.deleteMany({ userId }).exec();

    return order;
  }

  async findByUser(userId) {
    return await Order.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id, userId) {
    return await Order.findOne({ _id: id, userId }).exec();
  }
}

export default MongoOrderRepository;
