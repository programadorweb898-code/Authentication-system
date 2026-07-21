import { jest } from '@jest/globals';

const Redis = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  emit: jest.fn(),
  duplicate: jest.fn().mockReturnThis(),
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
  // Añadir otros métodos que se usen si es necesario
}));

export default Redis;
