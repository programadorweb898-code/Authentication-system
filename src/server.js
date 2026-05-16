import express from 'express';
import routerUser from './routes/routes.users.js';
import reset from './recovery/recovery.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errors.middlewares.js';
import { notFound } from './middlewares/notFound.middlewares.js';
import dotenv from 'dotenv';
import { connectDb } from '../config/db.js';
dotenv.config();
connectDb();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routerUser);
app.use('/recovery', reset);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log('servidor corriendo en el puerto 4000'));
