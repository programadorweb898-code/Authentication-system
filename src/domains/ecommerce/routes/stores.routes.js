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

router.get('/pickup', StoreController.getPickupStores);
router.get('/', StoreController.getAll);
router.get('/:id', StoreController.getOne);
router.post('/', authMiddleware, authorize(['product:write']), validationCreateStore, validationFields, StoreController.create);
router.patch('/:id', authMiddleware, authorize(['product:write']), validationUpdateStore, validationFields, StoreController.update);
router.delete('/:id', authMiddleware, authorize(['product:write']), StoreController.remove);

export default router;
