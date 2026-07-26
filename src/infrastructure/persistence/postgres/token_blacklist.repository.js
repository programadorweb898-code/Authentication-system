import { AppDataSource } from '../data-source.js';
import { TokenBlacklist } from '../entities/token_blacklist.entity.js';
import TokenBlacklistRepository from '../../../domains/auth/repositories/token_blacklist.repository.interface.js';

export class PostgresTokenBlacklistRepository extends TokenBlacklistRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(TokenBlacklist);
  }

  async add(token) {
    const entry = this.repository.create({ token });
    return await this.repository.save(entry);
  }

  async isBlacklisted(token) {
    const entry = await this.repository.findOneBy({ token });
    return !!entry;
  }
}
