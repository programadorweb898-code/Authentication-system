import mongoose from 'mongoose';
import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../infrastructure/logger.js';

dotenv.config();

const { Pool } = pg;

let pgPool = null;

if (process.env.DB_TYPE === 'postgres' || process.env.DB_TYPE === 'both' || !process.env.DB_TYPE) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export const connectDb = async (retries = 5) => {
  const dbType = process.env.DB_TYPE || 'both';

  // Conectar MongoDB
  if (dbType === 'mongo' || dbType === 'both') {
    while (retries) {
      try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('Conexión a MongoDB correcta');
        break;
      } catch (err) {
        retries -= 1;
        logger.error(`Error en MongoDB:${err.message}. Reintentos: ${retries}`);
        if (retries === 0) process.exit(1);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  // Conectar Postgres (Neon)
  if (dbType === 'postgres' || dbType === 'both') {
    try {
      if (pgPool) {
        await pgPool.query('SELECT NOW()');
        logger.info('Conexión a PostgreSQL (Neon) correcta');
      }
    } catch (err) {
      logger.error(`Error en la conexión a PostgreSQL: ${err.message}`);
      process.exit(1);
    }
  }
};

export { pgPool };
