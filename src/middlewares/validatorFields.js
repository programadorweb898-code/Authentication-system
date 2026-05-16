import { validationResult } from 'express-validator';

export const validationFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errores: errors.array() });
  }
  return next();
};
