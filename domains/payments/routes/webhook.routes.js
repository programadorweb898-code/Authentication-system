import express from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// El webhook necesita el cuerpo crudo para la validación de la firma de Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
