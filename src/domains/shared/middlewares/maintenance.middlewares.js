import { getSettings } from '../services/systemSettings.services.js';

export const maintenanceMiddleware = async (req, res, next) => {
  const settings = await getSettings();
  if (settings.maintenanceMode) {
    const error = new Error('El sistema está en modo mantenimiento. Por favor, intente más tarde.');
    error.statusCode = 503;
    return next(error);
  }
  return next();
};
