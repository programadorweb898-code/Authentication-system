import { Payment } from './payment.mongo.model.js';
import PaymentRepositoryInterface from '../payment.repository.interface.js';

export class PaymentMongoRepository extends PaymentRepositoryInterface {
  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async findById(paymentId) {
    return await Payment.findOne({ paymentId });
  }

  async updateStatus(paymentId, status) {
    return await Payment.findOneAndUpdate(
      { paymentId },
      { status },
      { new: true }
    );
  }
}
