import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  loginRateLimit: { type: Number, default: 5 }, // intentos
  updatedAt: { type: Date, default: Date.now },
});

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
