import express from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/payments/webhook:
 *   post:
 *     summary: Endpoint de webhook para Stripe
 *     tags: [Payments]
 *     description: Recibe notificaciones de eventos de Stripe. Requiere cuerpo crudo para validación de firma.
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *       400:
 *         description: Error en la validación de la firma o datos
 */
// El webhook necesita el cuerpo crudo para la validación de la firma de Stripe
router.post('/', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
