import { Router } from 'express';
import { StoreController } from '../controllers/stores.controller.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../../shared/middlewares/authorize.middlewares.js';
import { validationFields } from '../../shared/middlewares/validatorFields.js';
import {
  validationCreateStore,
  validationUpdateStore,
} from '../validators/stores.validators.js';

const router = Router();

/**
 * @openapi
 * /api/stores/pickup:
 *   get:
 *     summary: Listar tiendas de recogida
 *     tags: [Stores]
 */
router.get('/pickup', StoreController.getPickupStores);
/**
 * @openapi
 * /api/stores:
 *   get:
 *     summary: Listar tiendas
 *     tags: [Stores]
 */
router.get('/', StoreController.getAll);
/**
 * @openapi
 * /api/stores/{id}:
 *   get:
 *     summary: Obtener tienda por ID
 *     tags: [Stores]
 */
router.get('/:id', StoreController.getOne);
/**
 * @openapi
 * /api/stores:
 *   post:
 *     summary: Crear tienda
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', authMiddleware, authorize(['product:write']), validationCreateStore, validationFields, StoreController.create);
/**
 * @openapi
 * /api/stores/{id}:
 *   patch:
 *     summary: Actualizar tienda
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id', authMiddleware, authorize(['product:write']), validationUpdateStore, validationFields, StoreController.update);
/**
 * @openapi
 * /api/stores/{id}:
 *   delete:
 *     summary: Eliminar tienda
 *     tags: [Stores]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authMiddleware, authorize(['product:write']), StoreController.remove);

export default router;
