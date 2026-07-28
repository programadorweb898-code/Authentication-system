import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { Store } from '../../../../infrastructure/database/entities/store.entity.js';

export const StoreService = {
  async create(data) {
    const repository = AppDataSource.getRepository(Store);
    const store = repository.create(data);
    return await repository.save(store);
  },

  async findAll() {
    const repository = AppDataSource.getRepository(Store);
    return await repository.find({ order: { name: 'ASC' } });
  },

  async findActivePickupStores() {
    const repository = AppDataSource.getRepository(Store);
    return await repository.find({ where: { isActive: true, isPickupAvailable: true } });
  },

  async findById(id) {
    const repository = AppDataSource.getRepository(Store);
    return await repository.findOneBy({ id });
  },

  async update(id, data) {
    const repository = AppDataSource.getRepository(Store);
    const store = await repository.findOneBy({ id });
    if (!store) return null;
    Object.assign(store, data);
    return await repository.save(store);
  },

  async delete(id) {
    const repository = AppDataSource.getRepository(Store);
    const result = await repository.delete(id);
    return result.affected > 0;
  },
};
