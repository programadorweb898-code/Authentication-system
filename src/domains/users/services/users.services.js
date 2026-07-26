export class UsersService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    const { password, ...rest } = user;
    return { ...rest, id: user.id || user._id };
  }

  async getAllUsers({ startDate, endDate, sortOrder = 'desc' } = {}) {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = new Date(startDate);
      if (endDate) where.createdAt.$lte = new Date(endDate);
    }
    const users = await this.userRepository.findAll(where, {
      sort: { createdAt: sortOrder === 'asc' ? 1 : -1 },
    });
    return users.map((user) => {
      const { password, ...rest } = user;
      return { ...rest, id: user.id || user._id };
    });
  }

  async deleteUser(userId) {
    return await this.userRepository.delete(userId);
  }

  async blockUser(userId, isBlocked) {
    const user = await this.userRepository.update(userId, { isBlocked });
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    if (isBlocked) {
      user.refreshTokens = [];
      await this.userRepository.save(user);
    }
    return { ...user, id: user.id || user._id };
  }

  async getUserStats() {
    const total = await this.userRepository.count();
    const last24h = await this.userRepository.countSince(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const blocked = await this.userRepository.count({ isBlocked: true });
    return { total, last24h, blocked };
  }

  async verifyUserManual(userId, isVerified) {
    const user = await this.userRepository.update(userId, { isVerified });
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return { ...user, id: user.id || user._id };
  }

  async updateUser(userId, data) {
    if (data.password) {
      delete data.password;
    }
    const user = await this.userRepository.update(userId, data);
    if (!user) return null;
    const { password, ...rest } = user;
    return { ...rest, id: user.id || user._id };
  }
}
