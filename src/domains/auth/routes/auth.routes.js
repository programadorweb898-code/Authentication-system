import express from 'express';
import {
  validationRegister,
  validationLogin,
  validationChangePassword,
} from '../../users/validators/users.validators.js';
import { validationFields } from '../../shared/middlewares/validatorFields.js';
import {
  registerControllers,
  loginControllers,
  refreshTokenControllers,
  verifyAccountController,
  resendVerificationCodeController,
  googleAuthCallbackController,
  logoutControllers,
  changePasswordController,
  revokeTokenController,
} from '../controllers/auth.controllers.js';
import passport from 'passport';

import {
  loginLimiter,
  requestLimiter,
} from '../../shared/middlewares/rateLimit.middlewares.js';

import { authMiddleware } from '../middlewares/auth.middlewares.js';

const router = express.Router();

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

router.post('/verify-account', verifyAccountController);

router.post('/resend-verification', resendVerificationCodeController);

router.post(
  '/login',
  loginLimiter,
  validationLogin,
  validationFields,
  loginControllers,
);
router.post('/refresh', refreshTokenControllers);

router.post('/logout', logoutControllers);

router.post('/revoke-token', authMiddleware, revokeTokenController);

router.post(
  '/change-password',
  authMiddleware,
  validationChangePassword,
  validationFields,
  changePasswordController,
);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login', // Redirect to login on failure
    session: false, // No session needed for API token flow
  }),
  googleAuthCallbackController,
);

export default router;
