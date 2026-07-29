import { getSystemSettingsService } from '../../../factory.js';

export const getSettingsController = async (req, res, next) => {
  try {
    const service = await getSystemSettingsService();
    const settings = await service.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettingsController = async (req, res, next) => {
  try {
    const service = await getSystemSettingsService();
    const settings = await service.updateSettings(req.body);
    res.status(200).json({ message: 'Configuración actualizada', settings });
  } catch (error) {
    next(error);
  }
};
