import TokenBlacklistRepository from '../../../../domains/auth/repositories/token_blacklist.repository.interface.js';
import { TokenBlacklist } from '../../../../domains/auth/models/tokenBlacklist.model.js';

/**
 * MongoTokenBlacklistRepository
 * Implementation of TokenBlacklistRepository using Mongoose.
 */
class MongoTokenBlacklistRepository extends TokenBlacklistRepository {
  /**
   * Agrega un token a la lista negra.
   * @param {string} token 
   */
  async add(token) {
    return await TokenBlacklist.create({ token });
  }

  /**
   * Verifica si un token está en la lista negra.
   * @param {string} token 
   * @returns {boolean}
   */
  async isBlacklisted(token) {
    const entry = await TokenBlacklist.findOne({ token });
    return !!entry;
  }
}

export default MongoTokenBlacklistRepository;
