export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token inválido o expirado';
  }

  if (err.code === 11000) {
    message = 'El usuario ya existe';
    statusCode = 409;
  }
  
  res.status(statusCode).json({ error: message });
};
