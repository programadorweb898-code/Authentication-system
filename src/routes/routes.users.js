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

router.post(
  '/register',
  validationRegister,
  validationFields,
  registerControllers,
);
router.post('/login', validationLogin, validationFields, loginControllers);
router.post('/refresh', refreshTokenControllers);
export default router;
