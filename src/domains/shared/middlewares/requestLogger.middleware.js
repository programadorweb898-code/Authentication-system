import crypto from 'crypto';
import logger from '../../../../infrastructure/logger.js';

export const requestLogger = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
