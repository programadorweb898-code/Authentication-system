import { connection } from '../../../infrastructure/redis.js';
import logger from '../../../infrastructure/logger.js';

export const idempotencyMiddleware = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header is required' });
  }

  try {
    const isProcessed = await connection.get(`idempotency:${idempotencyKey}`);

    if (isProcessed) {
      return res.status(409).json({ error: 'Payment request is already being processed or completed' });
    }

    // Marcamos como procesando (TTL de 1 hora)
    await connection.set(`idempotency:${idempotencyKey}`, 'processing', 'EX', 3600);
    
    next();
  } catch (error) {
    logger.error('Idempotency middleware error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
