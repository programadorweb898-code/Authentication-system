import { AppDataSource } from './data-source.js';
import { User } from './entities/user.entity.js';
import { RefreshToken } from './entities/refresh_token.entity.js';
import UserRepository from '../../../domains/users/repositories/user.repository.interface.js';

export class PostgresUserRepository extends UserRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id) {
    return await this.repository.findOne({
      where: { id },
      relations: { refreshTokens: true }
    });
  }

  async findByEmail(email) {
    return await this.repository.findOne({
      where: { email },
      relations: { refreshTokens: true },
    });
  }

  async findByPhone(phone) {
    return await this.repository.findOne({
      where: { phone },
      relations: { refreshTokens: true },
    });
  }

  async findByRefreshToken(token) {
    return await this.repository.findOne({
      where: { refreshTokens: { token } },
      relations: { refreshTokens: true }
    });
  }

  async create(userData) {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async update(id, data) {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async save(user) {
    if (user.refreshTokens && user.refreshTokens.length > 0) {
      user.refreshTokens = user.refreshTokens.map((rt) => {
        if (rt instanceof RefreshToken) return rt;
        const entity = new RefreshToken();
        entity.token = rt.token;
        entity.user = user;
        return entity;
      });
    }
    return await this.repository.save(user);
  }

  async findAll(where = {}, options = {}) {
    return await this.repository.find({
      where,
      order: options.sort,
    });
  }

  async delete(id) {
    await this.repository.delete(id);
  }

  async count(where = {}) {
    return await this.repository.count({ where });
  }

  async countSince(date) {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date })
      .getCount();
  }

  async findByGoogleId(googleId) {
    return await this.repository.findOne({
      where: { googleId },
      relations: { refreshTokens: true },
    });
  }
}
