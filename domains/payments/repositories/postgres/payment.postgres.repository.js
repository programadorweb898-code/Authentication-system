import PaymentRepositoryInterface from '../payment.repository.interface.js';

export class PaymentPostgresRepository extends PaymentRepositoryInterface {
  async create(paymentData) {
    // Implementación para Postgres (ej: usando Sequelize o Knex)
    throw new Error('Not implemented');
  }

  async findById(paymentId) {
    // Implementación para Postgres
    throw new Error('Not implemented');
  }

  async updateStatus(paymentId, status) {
    // Implementación para Postgres
    throw new Error('Not implemented');
  }
}
