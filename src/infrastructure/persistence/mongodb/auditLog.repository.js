import { AuditLog } from '../../../domains/users/models/auditLog.model.js';
import AuditLogRepository from '../../../domains/users/repositories/auditLog.repository.interface.js';

class MongoAuditLogRepository extends AuditLogRepository {
  async create(entry) {
    return await AuditLog.create(entry);
  }
}

export default MongoAuditLogRepository;
