import { Queue } from 'bullmq';
import { connection } from '../../../../infrastructure/redis.js';

export const emailQueue = new Queue('email-notifications', { connection });
