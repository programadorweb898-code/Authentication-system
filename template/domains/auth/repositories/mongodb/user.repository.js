import User from '../../../../src/domains/users/models/user.models.js';
import UserRepository from '../../../../src/domains/users/repositories/user.repository.interface.js';

class MongoUserRepository extends UserRepository {
  async findById(id) {
    return await User.findById(id).exec();
  }

  async findByEmail(email) {
    return await User.findOne({ email }).exec();
  }

  async findByPhone(phone) {
    return await User.findOne({ phone }).exec();
  }

  async findByRefreshToken(token) {
    return await User.findOne({ refreshTokens: { token } }).exec();
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async save(user) {
    return await user.save();
  }

  async findAll(where = {}, options = {}) {
    return await User.find(where).sort(options.sort).exec();
  }

  async delete(id) {
    await User.findByIdAndDelete(id).exec();
  }

  async count(where = {}) {
    return await User.countDocuments(where).exec();
  }

  async countSince(date) {
    return await User.countDocuments({ createdAt: { $gte: date } }).exec();
  }

  async findByGoogleId(googleId) {
    return await User.findOne({ googleId }).exec();
  }
}

export default MongoUserRepository;
