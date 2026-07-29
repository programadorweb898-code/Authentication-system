import express from 'express';
import { getSettingsController, updateSettingsController } from '../controllers/systemSettings.controllers.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../middlewares/authorize.middlewares.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = express.Router();

// Asumimos que los ajustes de sistema requieren escritura para actualizar y lectura para get
router.use(authMiddleware);

/**
 * @openapi
 * /api/admin/settings:
 *   get:
 *     summary: Obtener ajustes de sistema
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authorize([PERMISSIONS.USER_READ]), getSettingsController);
/**
 * @openapi
 * /api/admin/settings:
 *   patch:
 *     summary: Actualizar ajustes de sistema
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/', authorize([PERMISSIONS.USER_WRITE]), updateSettingsController);

export default router;
