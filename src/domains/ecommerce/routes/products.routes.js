import { Router } from 'express';
import { ProductController } from '../controllers/products.controller.js';
import { ProductImageController } from '../controllers/productImages.controller.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../../shared/middlewares/authorize.middlewares.js';
import { validationFields } from '../../shared/middlewares/validatorFields.js';
import {
  validationCreateProduct,
  validationUpdateProduct,
  validationAddToCart,
  validationCreateOrder,
} from '../validators/products.validators.js';
import { uploadDocument } from '../middlewares/upload.middlewares.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/cart', authMiddleware, ProductController.getCart);
router.get('/orders', authMiddleware, ProductController.getMyOrders);
router.get('/orders/:id', authMiddleware, ProductController.getOrderById);
router.get('/:id', ProductController.getOne);
router.get('/:id/images', ProductImageController.list);
router.post('/', authMiddleware, authorize(['product:write']), validationCreateProduct, validationFields, ProductController.create);
router.post('/cart', authMiddleware, validationAddToCart, validationFields, ProductController.addToCart);
router.post('/:id/images', authMiddleware, authorize(['product:write']), ProductImageController.add);
router.post('/:id/images/upload', authMiddleware, authorize(['product:write']), uploadDocument, ProductImageController.addFromFile);
router.delete('/cart/:productId', authMiddleware, ProductController.removeFromCart);
router.delete('/cart', authMiddleware, ProductController.clearCart);
router.delete('/:id', authMiddleware, authorize(['product:write']), ProductController.remove);
router.delete('/:id/images/:imageId', authMiddleware, authorize(['product:write']), ProductImageController.remove);
router.post('/orders', authMiddleware, validationCreateOrder, validationFields, ProductController.createOrder);
router.patch('/:id', authMiddleware, authorize(['product:write']), validationUpdateProduct, validationFields, ProductController.update);
router.patch('/:id/images/:imageId/main', authMiddleware, authorize(['product:write']), ProductImageController.setMain);

export default router;
