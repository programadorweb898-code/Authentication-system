import express from 'express';
import { getSettingsController, updateSettingsController } from '../controllers/systemSettings.controllers.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../middlewares/authorize.middlewares.js';

const router = express.Router();

router.use(authMiddleware, authorize(['admin']));

router.get('/', getSettingsController);
router.patch('/', updateSettingsController);

export default router;
