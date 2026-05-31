import rateLimit from 'express-rate-limit';

const rateLimiter = (max, windowMs) => {
  return rateLimit({
    windowMs: windowMs * 60 * 1000,

    max: max,

    skip: (req) =>
      process.env.NODE_ENV === 'test' && !req.header('x-test-rate-limit'),

    message: {
      error: 'Demasiados intentos, intenta más tarde',
    },

    standardHeaders: true,

    legacyHeaders: false,
  });
};
export const loginLimiter = rateLimiter(20, 15);

export const requestLimiter = rateLimiter(5, 15);

export const verifyLimiter = rateLimiter(10, 15);
