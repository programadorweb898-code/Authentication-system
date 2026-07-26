import { getSystemSettingsService } from '../../../factory.js';

export const maintenanceMiddleware = async (req, res, next) => {
  const service = await getSystemSettingsService();
  const settings = await service.getSettings();
  if (settings.maintenanceMode) {
    const error = new Error('El sistema está en modo mantenimiento. Por favor, intente más tarde.');
    error.statusCode = 503;
    return next(error);
  }
  return next();
};
