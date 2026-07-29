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

/**
 * @openapi
 * /api/recovery/recoveryCode:
 *   post:
 *     summary: Solicitar código de recuperación
 *     tags: [Recovery]
 */
router.post(
  '/recoveryCode',
  requestLimiter,
  recoveryRequestValidator,
  validationFields,
  recoveryRequestControllers,
);

/**
 * @openapi
 * /api/recovery/verifyCode:
 *   post:
 *     summary: Verificar código de recuperación
 *     tags: [Recovery]
 */
router.post(
  '/verifyCode',
  verifyLimiter,
  verifyCodeValidator,
  validationFields,
  verifyCodeControllers,
);

/**
 * @openapi
 * /api/recovery/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Recovery]
 */
router.post(
  '/reset-password',
  resetPasswordValidator,
  validationFields,
  resetPasswordControllers,
);

export default router;
