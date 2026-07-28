/**
 * Payment Repository Interface
 * Defines the contract for payment persistence operations.
 */
class PaymentRepositoryInterface {
  async create(paymentData) {
    throw new Error('Method create must be implemented');
  }

  async findById(paymentId) {
    throw new Error('Method findById must be implemented');
  }

  async updateStatus(paymentId, status) {
    throw new Error('Method updateStatus must be implemented');
  }
}

export default PaymentRepositoryInterface;
