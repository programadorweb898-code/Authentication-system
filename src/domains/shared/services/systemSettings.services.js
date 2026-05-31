import { SystemSettings } from '../models/systemSettings.model.js';

let cachedSettings = null;

const loadSettings = async () => {
  let settings = await SystemSettings.findOne({});
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  cachedSettings = settings;
};

export const getSettings = async () => {
  if (!cachedSettings) {
    await loadSettings();
  }
  return cachedSettings;
};

export const updateSettings = async (newSettings) => {
  const settings = await SystemSettings.findOneAndUpdate({}, newSettings, {
    new: true,
    upsert: true,
  });
  cachedSettings = settings;
  return settings;
};
