import { ROLE_PERMISSIONS } from '../config/permissions.js';

export const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    // req.user debe estar poblado por el authMiddleware
    if (!req.user || !req.user.role) {
      const error = new Error('No autorizado');
      error.statusCode = 401;
      return next(error);
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    // Verificar si el usuario tiene todos los permisos requeridos
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      const error = new Error('No tienes permiso para realizar esta acción');
      error.statusCode = 403; // Forbidden
      return next(error);
    }
    return next();
  };
};
