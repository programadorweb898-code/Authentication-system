export class SystemSettingsService {
  constructor(systemSettingsRepository) {
    this.systemSettingsRepository = systemSettingsRepository;
    this.cachedSettings = null;
  }

  async getSettings() {
    if (!this.cachedSettings) {
      this.cachedSettings = await this.systemSettingsRepository.get();
    }
    return this.cachedSettings;
  }

  async updateSettings(newSettings) {
    const settings = await this.systemSettingsRepository.upsert(newSettings);
    this.cachedSettings = settings;
    return settings;
  }
}
