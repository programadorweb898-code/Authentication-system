import { Router } from 'express';
import {
  getProductsControllers,
  getProductController,
} from '../controllers/products.controllers.js';

const router = Router();
router.get('/getProducts', getProductsControllers);
router.get('/getProduct/:id', getProductController);

export default router;
