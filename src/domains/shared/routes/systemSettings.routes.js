import express from 'express';
import { getSettingsController, updateSettingsController } from '../controllers/systemSettings.controllers.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../middlewares/authorize.middlewares.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = express.Router();

// Asumimos que los ajustes de sistema requieren escritura para actualizar y lectura para get
router.use(authMiddleware);

router.get('/', authorize([PERMISSIONS.USER_READ]), getSettingsController);
router.patch('/', authorize([PERMISSIONS.USER_WRITE]), updateSettingsController);

export default router;
