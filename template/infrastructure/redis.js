import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Necesario para BullMQ
};

export const connection = new Redis(redisConfig);
