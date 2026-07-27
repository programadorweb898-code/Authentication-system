import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model('CartItem', cartItemSchema);
