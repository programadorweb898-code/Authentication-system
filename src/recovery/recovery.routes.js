import { Router } from 'express';
import {
  recoveryControllers,
  verifyCodeControllers,
  resetPasswordController,
} from './recovery.controllers.js';
import {
  recoveryValidation,
  verifyCodeValidation,
  passwordValidation,
} from './recovery.validators.js';
import { validationFields } from '../middlewares/validatorFields.js';
import {
  requestLimiter,
  verifyLimiter,
} from '../middlewares/rateLimit.middlewares.js';
const router = Router();

router.post(
  '/recoveryCode',
  requestLimiter,
  recoveryValidation,
  validationFields,
  recoveryControllers,
);

router.post(
  '/verifyCode',
  verifyLimiter,
  verifyCodeValidation,
  validationFields,
  verifyCodeControllers,
);

router.post(
  '/reset-password',
  requestLimiter,
  passwordValidation,
  validationFields,
  resetPasswordController,
);

export default router;
