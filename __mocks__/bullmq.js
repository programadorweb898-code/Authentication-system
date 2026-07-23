import { jest } from '@jest/globals';

const workersByQueue = new Map();

export class Queue {
  constructor(queueName) {
    this.queueName = queueName;
    this.add = jest.fn(async (jobName, data) => {
      const job = { id: `mock-job-${Date.now()}`, name: jobName, data };
      const processors = workersByQueue.get(queueName) || [];
      for (const processor of processors) {
        await processor(job);
      }
      return job;
    });
    this.close = jest.fn().mockResolvedValue();
  }
}

export class Worker {
  constructor(queueName, processor) {
    const list = workersByQueue.get(queueName) || [];
    list.push(processor);
    workersByQueue.set(queueName, list);
    this.on = jest.fn();
    this.close = jest.fn().mockResolvedValue();
  }
}
