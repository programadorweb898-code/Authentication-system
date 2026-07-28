import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { SystemSettings } from '../../../../infrastructure/database/entities/system_settings.entity.js';
import SystemSettingsRepositoryInterface from '../../../../src/domains/shared/repositories/systemSettings.repository.interface.js';

export class PostgresSystemSettingsRepository extends SystemSettingsRepositoryInterface {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(SystemSettings);
  }

  async get() {
    const settings = await this.repository.find();
    if (settings.length === 0) {
      return await this.repository.save(this.repository.create({}));
    }
    return settings[0];
  }

  async upsert(data) {
    const existing = await this.get();
    Object.assign(existing, data);
    return await this.repository.save(existing);
  }
}
