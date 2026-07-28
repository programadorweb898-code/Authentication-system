import express from 'express';
import { processPayment } from '../controllers/payment.controller.js';
import { authMiddleware } from '../../auth/middlewares/auth.middlewares.js';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware.js';

const router = express.Router();

router.post('/process', authMiddleware, idempotencyMiddleware, processPayment);

export default router;
