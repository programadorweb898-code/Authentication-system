import logger from '../../../../infrastructure/logger.js';

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

  // Sanitizar el body para no loggear datos sensibles
  const sanitizedBody = { ...req.body };
  const sensitiveFields = [
    'password',
    'confirmPassword',
    'token',
    'recoveryCode',
    'verificationCode',
  ];
  sensitiveFields.forEach((field) => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = '[REDACTED]';
    }
  });

  // Loggear el error usando Winston
  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    {
      stack: err.stack,
      body: sanitizedBody,
      params: req.params,
      query: req.query,
    },
  );

  const responseMessage = statusCode === 500 ? 'Error interno del servidor' : message;

  res.status(statusCode).json({ error: responseMessage });
};
