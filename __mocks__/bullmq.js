import { jest } from '@jest/globals';
export const Queue = jest.fn().mockImplementation(() => ({
  add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
  close: jest.fn().mockResolvedValue(),
}));
export const Worker = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  close: jest.fn().mockResolvedValue(),
}));
