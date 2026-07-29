import { PaymentMongoRepository } from './repositories/mongodb/payment.mongo.repository.js';
import { PaymentPostgresRepository } from './repositories/postgres/payment.postgres.repository.js';

export const getPaymentRepository = () => {
  const dbType = process.env.DB_TYPE || 'mongo';

  switch (dbType) {
    case 'postgres':
      return new PaymentPostgresRepository();
    case 'mongo':
    default:
      return new PaymentMongoRepository();
  }
};
