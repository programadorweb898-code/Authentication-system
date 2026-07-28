import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { Address } from '../../../../infrastructure/database/entities/address.entity.js';

export const AddressService = {
  async create(userId, data) {
    const repository = AppDataSource.getRepository(Address);

    if (data.isDefault) {
      await repository.update({ userId }, { isDefault: false });
    }

    const address = repository.create({ ...data, userId });
    return await repository.save(address);
  },

  async findByUser(userId) {
    const repository = AppDataSource.getRepository(Address);
    return await repository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  },

  async findById(id, userId) {
    const repository = AppDataSource.getRepository(Address);
    return await repository.findOneBy({ id, userId });
  },

  async update(id, userId, data) {
    const repository = AppDataSource.getRepository(Address);
    const address = await repository.findOneBy({ id, userId });
    if (!address) return null;

    if (data.isDefault) {
      await repository.update({ userId }, { isDefault: false });
    }

    Object.assign(address, data);
    return await repository.save(address);
  },

  async delete(id, userId) {
    const repository = AppDataSource.getRepository(Address);
    const result = await repository.delete({ id, userId });
    return result.affected > 0;
  },
};
