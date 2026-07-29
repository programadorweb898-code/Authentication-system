import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  status: { type: String, default: 'pending' },
  total: { type: Number, required: true },
  deliveryMethod: { type: String, default: 'shipping' },
  storeId: { type: String, default: null },
  shippingAddressId: { type: String, default: null },
  items: [orderItemSchema],
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
