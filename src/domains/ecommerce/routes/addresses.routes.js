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

router.post('/', validationCreateAddress, validationFields, AddressController.create);
router.get('/', AddressController.getAll);
router.patch('/:id', validationUpdateAddress, validationFields, AddressController.update);
router.delete('/:id', AddressController.remove);

export default router;
