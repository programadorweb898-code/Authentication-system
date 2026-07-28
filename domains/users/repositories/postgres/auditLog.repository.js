import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { AuditLog } from '../../../../infrastructure/database/entities/audit_log.entity.js';
import AuditLogRepositoryInterface from '../../../../src/domains/users/repositories/auditLog.repository.interface.js';

export class PostgresAuditLogRepository extends AuditLogRepositoryInterface {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(AuditLog);
  }

  async create(entry) {
    const record = this.repository.create(entry);
    return await this.repository.save(record);
  }

  async findByUser(userId) {
    return await this.repository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findAll(filters = {}) {
    return await this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
