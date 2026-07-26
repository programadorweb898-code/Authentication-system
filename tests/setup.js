import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';
import { AppDataSource } from '../src/infrastructure/persistence/postgres/data-source';

jest.mock('ioredis');

dotenv.config({ path: '.env.test' });

jest.setTimeout(60000); // 60 segundos de timeout

const dbType = process.env.DB_TYPE || 'postgres';

beforeAll(async () => {
  if (dbType === 'mongo') {
      if (mongoose.connection.readyState === 0) {
        console.log('Conectando a MongoDB en tests...');
        await mongoose.connect(process.env.MONGO_URI);
      }
  } else if (dbType === 'postgres') {
      if (!AppDataSource.isInitialized) {
        console.log('Conectando a Postgres en tests...');
        await AppDataSource.initialize();
      }
  }
});

afterAll(async () => {
  if (dbType === 'mongo') {
      await mongoose.connection.close();
  } else {
      await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  if (dbType === 'mongo') {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
  } else {
      const entities = AppDataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        const tableName = repository.metadata.tableName;
        await AppDataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      }
  }
});
