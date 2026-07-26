export class AuditService {
  constructor(auditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  async logAdminAction(adminId, action, targetUserId, details = {}) {
    try {
      await this.auditLogRepository.create({
        adminId,
        action,
        targetUserId,
        details,
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }
}
