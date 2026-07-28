import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';
import { AppDataSource } from '../infrastructure/database/data-source.js';

jest.mock('ioredis', () => {
  const Redis = function () {};
  const methods = {};
  ['get', 'set', 'setex', 'del', 'incr', 'expire', 'ttl', 'quit', 'on', 'status', 'pipeline'].forEach(k => {
    methods[k] = jest.fn();
    if (['get', 'set', 'setex', 'del', 'incr', 'expire', 'ttl'].includes(k)) {
      methods[k].mockResolvedValue(null);
    }
  });
  Redis.prototype = methods;
  return Redis;
});
jest.mock('bullmq');

jest.mock('mongoose', () => {
  const baseUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'user@example.com',
    phone: null,
    role: 'user',
    isBlocked: false,
    isVerified: true,
    refreshTokens: [],
    loginAttempts: 0,
    save: function () { return Promise.resolve(this); },
  };

  const mkQuery = (val) => {
    const resolveVal = typeof val === 'function' ? val() : val;
    const q = {
      select: () => q,
      sort: () => q,
      lean: () => q,
      populate: () => q,
      limit: () => q,
      skip: () => q,
      then: (resolve) => resolve(resolveVal),
      catch: () => q,
    };
    return q;
  };

  return {
    Schema: Object.assign(function MockSchema() {}, {
      Types: {
        ObjectId: 'ObjectId',
        String: String, Number: Number,
        Boolean: Boolean, Date: Date,
        Buffer: Buffer, Mixed: 'Mixed',
        Decimal128: 'Decimal128', Map: 'Map',
      },
      prototype: {
        pre: () => {}, post: () => {},
        virtual: () => ({ get: () => {}, set: () => {} }),
        index: () => {}, plugin: () => {}, add: () => {},
        path: () => {}, eachPath: () => {}, remove: () => {},
      },
    }),
    Types: {
      ObjectId: function (id) { return id || '507f1f77bcf86cd799439011'; },
    },
    model: () => {
      const Model = function (data) {
        Object.assign(this, data);
      };
      Model.prototype.save = function () { return Promise.resolve(this); };
      Object.assign(Model, {
        findById: (id) => mkQuery(baseUser),
        findOne: () => mkQuery(baseUser),
        findByIdAndUpdate: (id, data) => mkQuery(() => ({ ...baseUser, ...data, save: baseUser.save })),
        findOneAndUpdate: (f, data) => mkQuery(() => ({ ...baseUser, ...data, save: baseUser.save })),
        findByIdAndDelete: () => mkQuery({ deletedCount: 1 }),
        create: (data) => Promise.resolve({ ...baseUser, ...data }),
        find: () => mkQuery([baseUser]),
        deleteOne: () => Promise.resolve({ deletedCount: 1 }),
        deleteMany: () => Promise.resolve({ deletedCount: 1 }),
        countDocuments: () => Promise.resolve(1),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        aggregate: () => Promise.resolve([]),
      });
      return Model;
    },
    connection: { readyState: 1, collections: {} },
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
  };
});

dotenv.config({ path: '.env.test' });

jest.setTimeout(60000);

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
