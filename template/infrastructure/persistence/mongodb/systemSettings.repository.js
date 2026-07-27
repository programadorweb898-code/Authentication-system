import { SystemSettings } from '../../../domains/shared/models/systemSettings.model.js';
import SystemSettingsRepository from '../../../domains/shared/repositories/systemSettings.repository.interface.js';

class MongoSystemSettingsRepository extends SystemSettingsRepository {
  async get() {
    let settings = await SystemSettings.findOne({}).exec();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    return settings;
  }

  async upsert(data) {
    return await SystemSettings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
    }).exec();
  }
}

export default MongoSystemSettingsRepository;
