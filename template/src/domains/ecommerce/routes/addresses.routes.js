import { Router } from 'express';
import { AddressController } from '../controllers/addresses.controller.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { validationFields } from '../../shared/middlewares/validatorFields.js';
import {
  validationCreateAddress,
  validationUpdateAddress,
} from '../validators/addresses.validators.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/addresses:
 *   post:
 *     summary: Crear dirección
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', validationCreateAddress, validationFields, AddressController.create);
/**
 * @openapi
 * /api/addresses:
 *   get:
 *     summary: Listar direcciones
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', AddressController.getAll);
/**
 * @openapi
 * /api/addresses/{id}:
 *   patch:
 *     summary: Actualizar dirección
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id', validationUpdateAddress, validationFields, AddressController.update);
/**
 * @openapi
 * /api/addresses/{id}:
 *   delete:
 *     summary: Eliminar dirección
 *     tags: [Addresses]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', AddressController.remove);

export default router;
