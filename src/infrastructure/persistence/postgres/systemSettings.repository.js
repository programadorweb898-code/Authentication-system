import { AppDataSource } from './data-source.js';
import { SystemSettings } from './entities/system_settings.entity.js';
import SystemSettingsRepository from '../../../domains/shared/repositories/systemSettings.repository.interface.js';

export class PostgresSystemSettingsRepository extends SystemSettingsRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(SystemSettings);
  }

  async get() {
    let settings = await this.repository.findOne({ where: {} });
    if (!settings) {
      settings = this.repository.create({});
      settings = await this.repository.save(settings);
    }
    return settings;
  }

  async upsert(data) {
    let settings = await this.repository.findOne({ where: {} });
    if (settings) {
      await this.repository.update(settings.id, data);
    } else {
      settings = this.repository.create(data);
    }
    return await this.repository.save(settings);
  }
}
