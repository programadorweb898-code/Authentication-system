import SystemSettingsRepositoryInterface from '../../../../src/domains/shared/repositories/systemSettings.repository.interface.js';

class MongoSystemSettingsRepository extends SystemSettingsRepositoryInterface {
  async get() {
    const { SystemSettings: Settings } = await import('../../../../src/domains/shared/models/systemSettings.model.js');
    const settings = await Settings.find();
    if (settings.length === 0) {
      return await Settings.create({});
    }
    return settings[0];
  }

  async upsert(data) {
    const { SystemSettings: Settings } = await import('../../../../src/domains/shared/models/systemSettings.model.js');
    const existing = await Settings.findOne();
    if (existing) {
      Object.assign(existing, data);
      return await existing.save();
    }
    return await Settings.create(data);
  }
}

export default MongoSystemSettingsRepository;
