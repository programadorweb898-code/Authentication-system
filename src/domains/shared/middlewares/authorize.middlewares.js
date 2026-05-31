export const authorize = (roles = []) => {
  return (req, res, next) => {
    // req.user debería ser poblado por authMiddleware antes de llamar a este
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error('No tienes permiso para realizar esta acción');
      error.statusCode = 403; // Forbidden
      return next(error);
    }
    return next();
  };
};
