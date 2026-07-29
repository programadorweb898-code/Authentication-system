import express from 'express';
import { getMe, updateMe, getAllUsersController, getUserController, deleteUserController, blockUserController, verifyUserController, getStatsController } from '../controllers/users.controllers.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../../shared/middlewares/authorize.middlewares.js';
import { PERMISSIONS } from '../../shared/config/permissions.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Obtener mi perfil
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/me', getMe);
/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     summary: Actualizar mi perfil
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/me', updateMe);

/**
 * @openapi
 * /api/users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stats', authorize([PERMISSIONS.USER_STATS_READ]), getStatsController);
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authorize([PERMISSIONS.USER_MANAGE]), getAllUsersController);
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', authorize([PERMISSIONS.USER_MANAGE]), getUserController);
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authorize([PERMISSIONS.USER_DELETE]), deleteUserController);
/**
 * @openapi
 * /api/users/{id}/block:
 *   patch:
 *     summary: Bloquear usuario
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/block', authorize([PERMISSIONS.USER_WRITE]), blockUserController);
/**
 * @openapi
 * /api/users/{id}/verify:
 *   patch:
 *     summary: Verificar usuario
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/verify', authorize([PERMISSIONS.USER_WRITE]), verifyUserController);

export default router;
