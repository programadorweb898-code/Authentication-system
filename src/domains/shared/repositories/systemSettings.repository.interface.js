class SystemSettingsRepository {
  async get() {
    throw new Error('Method get must be implemented');
  }

  async upsert(data) {
    throw new Error('Method upsert must be implemented');
  }
}

export default SystemSettingsRepository;
