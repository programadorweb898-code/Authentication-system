import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import authRoutes from './domains/auth/routes/auth.routes.js';
import recoveryRoutes from './domains/recovery/routes/recovery.routes.js';
import productsRoutes from './domains/ecommerce/routes/products.routes.js';
import addressesRoutes from './domains/ecommerce/routes/addresses.routes.js';
import storesRoutes from './domains/ecommerce/routes/stores.routes.js';
import usersRoutes from './domains/users/routes/users.routes.js';
import systemSettingsRoutes from './domains/shared/routes/systemSettings.routes.js';
import paymentRoutes from '../domains/payments/routes/payment.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import webhookRoutes from '../domains/payments/routes/webhook.routes.js';
import { errorHandler } from './domains/shared/errors/errors.middlewares.js';
import { notFound } from './domains/shared/middlewares/notFound.middlewares.js';
import { maintenanceMiddleware } from './domains/shared/middlewares/maintenance.middlewares.js';
import { requestLogger } from './domains/shared/middlewares/requestLogger.middleware.js';
import dotenv from 'dotenv';
import { connectDb } from '../config/db.js';
import passport from '../config/passport.js';

dotenv.config();

// Solo conectar a la DB si no estamos en entorno de test.
if (process.env.NODE_ENV !== 'test') {
  connectDb();
}

const app = express();

app.use(cors());
app.use('/api/payments/webhook', webhookRoutes);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(maintenanceMiddleware);
app.use(requestLogger);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin/settings', systemSettingsRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
