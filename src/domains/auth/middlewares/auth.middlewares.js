import jwt from 'jsonwebtoken';
import User from '../../users/models/user.models.js';
import { TokenBlacklist } from '../../../../domains/auth/models/tokenBlacklist.model.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const error = new Error('No se proporcionó un token de acceso');
    error.statusCode = 401;
    return next(error);
  }

  try {
    // Verificar si el token está en la lista negra
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      const error = new Error('Token revocado');
      error.statusCode = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 401;
      return next(error);
    }

    if (user.isBlocked) {
      const error = new Error('Usuario bloqueado por administrador');
      error.statusCode = 403;
      return next(error);
    }

    req.user = user;
    return next();
  } catch (_err) {
    const error = new Error('Token inválido o expirado');
    error.statusCode = 401;
    return next(error);
  }
};
