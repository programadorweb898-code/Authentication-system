import express from 'express';
import {
  validationRegister,
  validationLogin,
} from '../validator/validators.users.js';
import { validationFields } from '../middlewares/validatorFields.js';
import {
  registerControllers,
  loginControllers,
  refreshTokenControllers,
} from '../controllers/controllers.users.js';
const router = express.Router();

import {
  loginLimiter,
  requestLimiter,
} from '../middlewares/rateLimit.middlewares.js';

import { authMiddleware } from '../middlewares/auth.middlewares.js';

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.post(
  '/register',
  requestLimiter,
  validationRegister,
  validationFields,
  registerControllers,
);
router.post(
  '/login',
  loginLimiter,
  validationLogin,
  validationFields,
  loginControllers,
);
router.post('/refresh', refreshTokenControllers);
export default router;
