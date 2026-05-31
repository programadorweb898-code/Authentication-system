import { AuditLog } from '../models/auditLog.model.js';

export const logAdminAction = async (adminId, action, targetUserId, details = {}) => {
  try {
    await AuditLog.create({
      adminId,
      action,
      targetUserId,
      details,
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // No lanzamos error para no interrumpir el flujo principal de la acción administrativa
  }
};
