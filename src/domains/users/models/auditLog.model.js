import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },
  details: {
    type: Object,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
