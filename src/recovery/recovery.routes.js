import { Router } from 'express';
import {
  recoveryControllers,
  verifyCodeControllers,
  resetPasswordController
} from './recovery.controllers.js';
import { recoveryValidation, verifyCodeValidation, passwordValidation } from './recovery.validators.js';
import { validationFields } from '../middlewares/validatorFields.js';
const router = Router();

router.post(
  '/recoveryCode',
  recoveryValidation,
  validationFields,
  recoveryControllers,
);

router.post(
  '/verifyCode',
  verifyCodeValidation,
  validationFields,
  verifyCodeControllers,
);

router.post(
  '/reset-password',
  passwordValidation,
  validationFields,
  resetPasswordController,
);

export default router;
