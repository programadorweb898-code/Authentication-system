import express from 'express';
import { processPayment } from '../controllers/payment.controller.js';
import { authMiddleware } from '../../../src/domains/auth/middlewares/auth.middlewares.js';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/payments/process:
 *   post:
 *     summary: Procesar un pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: {type: number}
 *               currency: {type: string}
 *               paymentMethodId: {type: string}
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
 *       400:
 *         description: Error en los datos del pago
 *       401:
 *         description: No autorizado
 */
router.post('/process', authMiddleware, idempotencyMiddleware, processPayment);

export default router;
