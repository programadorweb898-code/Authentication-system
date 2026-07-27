import User from '../../../domains/users/models/user.models.js';
import UserRepository from '../../../domains/users/repositories/user.repository.interface.js';

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
    return await User.findOne({ 'refreshTokens.token': token }).exec();
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async save(user) {
    return await user.save();
  }

  async findAll(where = {}, options = {}) {
    let query = User.find(where);
    if (options.sort) query = query.sort(options.sort);
    if (options.select) query = query.select(options.select);
    return await query.exec();
  }

  async delete(id) {
    return await User.findByIdAndDelete(id).exec();
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
