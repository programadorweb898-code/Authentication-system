import jwt from 'jsonwebtoken';
import { getRepositories } from '../../../factory.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const error = new Error('No se proporcionó un token de acceso');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const { userRepository, tokenBlacklistRepository } = await getRepositories();

    const isBlacklisted = await tokenBlacklistRepository.isBlacklisted(token);
    if (isBlacklisted) {
      const error = new Error('Token revocado');
      error.statusCode = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(decoded.id);

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

    req.user = { ...user, id: user.id || user._id };
    return next();
  } catch (_err) {
    const error = new Error('Token inválido o expirado');
    error.statusCode = 401;
    return next(error);
  }
};
