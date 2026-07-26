/**
 * User Repository Interface
 * Defines the contract for user persistence operations.
 */
class UserRepository {
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }

  async findByPhone(phone) {
    throw new Error('Method findByPhone must be implemented');
  }

  async findByRefreshToken(token) {
    throw new Error('Method findByRefreshToken must be implemented');
  }

  async create(userData) {
    throw new Error('Method create must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update must be implemented');
  }

  async save(user) {
    throw new Error('Method save must be implemented');
  }
}

export default UserRepository;
