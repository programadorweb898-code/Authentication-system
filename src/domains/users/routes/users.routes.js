import express from 'express';
import { getMe, updateMe, getAllUsersController, getUserController, deleteUserController, blockUserController, verifyUserController, getStatsController } from '../controllers/users.controllers.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../../shared/middlewares/authorize.middlewares.js';

const router = express.Router();

router.use(authMiddleware);

// Rutas de usuario
router.get('/me', getMe);
router.patch('/me', updateMe);

// Rutas de administración (solo admin)
router.get('/stats', authorize(['admin']), getStatsController);
router.get('/', authorize(['admin']), getAllUsersController);
router.get('/:id', authorize(['admin']), getUserController);
router.delete('/:id', authorize(['admin']), deleteUserController);
router.patch('/:id/block', authorize(['admin']), blockUserController);
router.patch('/:id/verify', authorize(['admin']), verifyUserController);

export default router;
