import { TokenBlacklist } from '../../../../domains/auth/models/tokenBlacklist.model.js';
import TokenBlacklistRepository from '../token_blacklist.repository.interface.js';

class MongoTokenBlacklistRepository extends TokenBlacklistRepository {
  async add(token, expiresAt) {
    const entry = new TokenBlacklist({ token });
    return await entry.save();
  }

  async isBlacklisted(token) {
    const entry = await TokenBlacklist.findOne({ token }).exec();
    return !!entry;
  }

  async removeExpired() {
    await TokenBlacklist.deleteMany({}).exec();
  }
}

export default MongoTokenBlacklistRepository;
