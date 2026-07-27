import { Router } from 'express';
import { ProductController } from '../controllers/products.controller.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);
router.post('/cart', authMiddleware, ProductController.addToCart);
router.post('/orders', authMiddleware, ProductController.createOrder);

export default router;
