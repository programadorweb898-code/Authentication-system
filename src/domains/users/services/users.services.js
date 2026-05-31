import User from '../models/user.models.js';

export const getUserById = async (userId) => {
  return await User.findById(userId).select('-password');
};

export const getAllUsers = async ({ startDate, endDate, sortOrder = 'desc' } = {}) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  return await User.find(query)
    .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
    .select('-password');
};

export const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

export const blockUser = async (userId, isBlocked) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked },
    { new: true },
  );
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  // Si se bloquea, invalidamos sesiones (refresh tokens)
  if (isBlocked) {
    user.refreshTokens = [];
    await user.save();
  }
  return user;
};

export const getUserStats = async () => {
  const total = await User.countDocuments();
  const last24h = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  const blocked = await User.countDocuments({ isBlocked: true });
  return { total, last24h, blocked };
};

export const verifyUserManual = async (userId, isVerified) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified },
    { new: true },
  );
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUser = async (userId, data) => {
  // Prevent password update here, it should be a separate flow
  if (data.password) {
    delete data.password;
  }
  return await User.findByIdAndUpdate(userId, data, { new: true }).select(
    '-password',
  );
};
