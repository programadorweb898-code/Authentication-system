import express from 'express';
import { getMe, updateMe, getAllUsersController, getUserController, deleteUserController, blockUserController, verifyUserController, getStatsController } from '../controllers/users.controllers.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../../shared/middlewares/authorize.middlewares.js';
import { PERMISSIONS } from '../../shared/config/permissions.js';

const router = express.Router();

router.use(authMiddleware);

// Rutas de usuario
router.get('/me', getMe);
router.patch('/me', updateMe);

// Rutas de administración (solo admin)
router.get('/stats', authorize([PERMISSIONS.USER_STATS_READ]), getStatsController);
router.get('/', authorize([PERMISSIONS.USER_MANAGE]), getAllUsersController);
router.get('/:id', authorize([PERMISSIONS.USER_MANAGE]), getUserController);
router.delete('/:id', authorize([PERMISSIONS.USER_DELETE]), deleteUserController);
router.patch('/:id/block', authorize([PERMISSIONS.USER_WRITE]), blockUserController);
router.patch('/:id/verify', authorize([PERMISSIONS.USER_WRITE]), verifyUserController);

export default router;
