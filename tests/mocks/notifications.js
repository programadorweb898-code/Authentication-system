import { jest } from '@jest/globals';

export const mockResend = {
  emails: {
    send: jest.fn().mockResolvedValue({ id: 'mock-id' }),
  },
};

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => mockResend),
  };
});
