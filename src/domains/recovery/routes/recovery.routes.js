import express from 'express';
import {
  recoveryRequestControllers,
  verifyCodeControllers,
  resetPasswordControllers,
} from '../controllers/recovery.controllers.js';
import {
  recoveryRequestValidator,
  verifyCodeValidator,
  resetPasswordValidator,
} from '../validators/recovery.validators.js';
import { validationFields } from '../../shared/middlewares/validatorFields.js';
import {
  requestLimiter,
  verifyLimiter,
} from '../../shared/middlewares/rateLimit.middlewares.js';

const router = express.Router();

router.post(
  '/recoveryCode',
  requestLimiter,
  recoveryRequestValidator,
  validationFields,
  recoveryRequestControllers,
);

router.post(
  '/verifyCode',
  verifyLimiter,
  verifyCodeValidator,
  validationFields,
  verifyCodeControllers,
);

router.post(
  '/reset-password',
  resetPasswordValidator,
  validationFields,
  resetPasswordControllers,
);

export default router;
