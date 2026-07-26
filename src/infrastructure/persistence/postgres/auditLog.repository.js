import { AppDataSource } from './data-source.js';
import { AuditLog } from './entities/audit_log.entity.js';
import AuditLogRepository from '../../../domains/users/repositories/auditLog.repository.interface.js';

export class PostgresAuditLogRepository extends AuditLogRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(AuditLog);
  }

  async create(entry) {
    const log = this.repository.create(entry);
    return await this.repository.save(log);
  }
}
