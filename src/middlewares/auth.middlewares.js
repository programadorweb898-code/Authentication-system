import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const error = new Error('No se proporcionó un token');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error('Token inválido o expirado');
    error.statusCode = 401;
    return next(error);
  }
};
