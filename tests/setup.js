import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

jest.mock('ioredis');

dotenv.config({ path: '.env.test' });

jest.setTimeout(30000); // 30 segundos de timeout

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  // Limpieza de índices zombies (como username_1 que no está en el esquema actual)
  try {
    const usersCollection = mongoose.connection.db.collection('users');
    const indexes = await usersCollection.indexes();
    if (indexes.some((idx) => idx.name === 'username_1')) {
      await usersCollection.dropIndex('username_1');
    }
  } catch (_error) {
    // La colección o el índice podrían no existir todavía
    if (_error.code !== 27) {
      console.warn('Advertencia en setup de test al intentar borrar índice:', _error.message);
   5     }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
