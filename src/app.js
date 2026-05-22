import express from 'express';
import cookieParser from 'cookie-parser';
import routerUser from './routes/routes.users.js';
import reset from './recovery/recovery.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errors.middlewares.js';
import { notFound } from './middlewares/notFound.middlewares.js';
import dotenv from 'dotenv';
import { connectDb } from '../config/db.js';

dotenv.config();

// Solo conectar a la DB si no estamos en entorno de test.
// En test, Jest se encargará de la conexión en el setup global.
if (process.env.NODE_ENV !== 'test') {
  connectDb();
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', routerUser);
app.use('/recovery', reset);

app.use(notFound);
app.use(errorHandler);

export default app;
