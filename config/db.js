import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../infrastructure/logger.js';

dotenv.config();

export const connectDb = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      logger.info('Conexión a la base de datos correcta');
      break;
    } catch (err) {
      retries -= 1;
      logger.error(
        `Error en la conexión a la base de datos. Reintentos restantes: ${retries}`,
        { error: err.message },
      );
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
