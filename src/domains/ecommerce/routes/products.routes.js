import { Router } from 'express';
import { ProductController } from '../controllers/products.controller.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { authorize } from '../../shared/middlewares/authorize.middlewares.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);
router.post('/', authMiddleware, authorize(['product:write']), ProductController.create);
router.post('/cart', authMiddleware, ProductController.addToCart);
router.delete('/cart/:productId', authMiddleware, ProductController.removeFromCart);
router.delete('/cart', authMiddleware, ProductController.clearCart);
router.post('/orders', authMiddleware, ProductController.createOrder);
router.patch('/:id', authMiddleware, authorize(['product:write']), ProductController.update);

export default router;
