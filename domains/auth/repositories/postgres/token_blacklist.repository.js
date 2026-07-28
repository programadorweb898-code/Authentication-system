import { AppDataSource } from '../../../../infrastructure/database/data-source.js';
import { TokenBlacklist } from '../../../../infrastructure/database/entities/token_blacklist.entity.js';
import TokenBlacklistRepository from '../token_blacklist.repository.interface.js';

export class PostgresTokenBlacklistRepository extends TokenBlacklistRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(TokenBlacklist);
  }

  async add(token, expiresAt) {
    const entry = this.repository.create({ token, expiresAt });
    return await this.repository.save(entry);
  }

  async isBlacklisted(token) {
    const entry = await this.repository.findOneBy({ token });
    return !!entry;
  }

  async removeExpired() {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < NOW()')
      .execute();
  }
}
