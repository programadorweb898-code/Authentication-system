import AuditLogRepositoryInterface from '../../../../src/domains/users/repositories/auditLog.repository.interface.js';

class MongoAuditLogRepository extends AuditLogRepositoryInterface {
  async log(action, userId, details) {
    const { AuditLog } = await import('../../../../src/domains/users/models/auditLog.model.js');
    const entry = new AuditLog({ action, userId, details });
    return await entry.save();
  }

  async findByUser(userId) {
    const { AuditLog } = await import('../../../../src/domains/users/models/auditLog.model.js');
    return await AuditLog.find({ userId }).sort({ createdAt: -1 });
  }

  async findAll(filters = {}) {
    const { AuditLog } = await import('../../../../src/domains/users/models/auditLog.model.js');
    return await AuditLog.find().sort({ createdAt: -1 });
  }
}

export default MongoAuditLogRepository;
