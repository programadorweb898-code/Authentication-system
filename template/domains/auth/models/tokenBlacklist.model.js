import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h', // TTL: Los documentos se eliminarán automáticamente tras 24 horas
  },
});

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
