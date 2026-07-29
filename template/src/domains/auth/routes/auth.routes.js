import express from 'express';
import {
  validationRegister,
  validationLogin,
  validationChangePassword,
  validationSetupMFA,
  validationConfirmMFA,
  validationDisableMFA,
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
  setup2FAController,
  confirm2FASetupController,
  verify2FAController,
  disable2FAController,
} from '../controllers/auth.controllers.js';
import passport from 'passport';

import {
  loginLimiter,
  requestLimiter,
} from '../../shared/middlewares/rateLimit.middlewares.js';

import { authMiddleware } from '../middlewares/auth.middlewares.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 */
router.post(
  '/register',
  requestLimiter,
  validationRegister,
  validationFields,
  registerControllers,
);

/**
 * @openapi
 * /api/auth/verify-account:
 *   post:
 *     summary: Verificar cuenta
 *     tags: [Auth]
 */
router.post('/verify-account', verifyAccountController);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenviar código de verificación
 *     tags: [Auth]
 */
router.post('/resend-verification', resendVerificationCodeController);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 */
router.post(
  '/login',
  loginLimiter,
  validationLogin,
  validationFields,
  loginControllers,
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token
 *     tags: [Auth]
 */
router.post('/refresh', refreshTokenControllers);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 */
router.post('/logout', logoutControllers);

/**
 * @openapi
 * /api/auth/revoke-token:
 *   post:
 *     summary: Revocar token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/revoke-token', authMiddleware, revokeTokenController);

/**
 * @openapi
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Configurar 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/setup', authMiddleware, validationSetupMFA, validationFields, setup2FAController);

/**
 * @openapi
 * /api/auth/2fa/confirm-setup:
 *   post:
 *     summary: Confirmar configuración 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/confirm-setup', authMiddleware, validationConfirmMFA, validationFields, confirm2FASetupController);

/**
 * @openapi
 * /api/auth/2fa/verify:
 *   post:
 *     summary: Verificar 2FA
 *     tags: [Auth]
 */
router.post('/2fa/verify', verify2FAController);

/**
 * @openapi
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Deshabilitar 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/disable', authMiddleware, validationDisableMFA, validationFields, disable2FAController);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/change-password',
  authMiddleware,
  validationChangePassword,
  validationFields,
  changePasswordController,
);

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Iniciar autenticación con Google
 *     tags: [Auth]
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback de autenticación con Google
 *     tags: [Auth]
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  googleAuthCallbackController,
);

export default router;
