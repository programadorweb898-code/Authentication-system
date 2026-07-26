import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import UserRepository from '../../../domains/users/repositories/user.repository.interface';

export class PostgresUserRepository extends UserRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id) {
    return await this.repository.findOneBy({ id });
  }

  async findByEmail(email) {
    return await this.repository.findOneBy({ email });
  }

  async findByPhone(phone) {
    return await this.repository.findOneBy({ phone });
  }

  async findByRefreshToken(token) {
    return await this.repository.findOne({
      where: { refreshTokens: { token } },
      relations: ['refreshTokens']
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
    return await this.repository.save(user);
  }
}
