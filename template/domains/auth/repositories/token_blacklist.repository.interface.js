/**
 * Token Blacklist Repository Interface
 * Defines the contract for token blacklist operations.
 */
class TokenBlacklistRepository {
  async add(token) {
    throw new Error('Method add must be implemented');
  }

  async isBlacklisted(token) {
    throw new Error('Method isBlacklisted must be implemented');
  }
}

export default TokenBlacklistRepository;
