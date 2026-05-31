import { getSettings, updateSettings } from '../services/systemSettings.services.js';

export const getSettingsController = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettingsController = async (req, res, next) => {
  try {
    const settings = await updateSettings(req.body);
    res.status(200).json({ message: 'Configuración actualizada', settings });
  } catch (error) {
    next(error);
  }
};
