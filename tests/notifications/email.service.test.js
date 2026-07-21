import { sendRecoveryEmail, sendWelcomeEmail } from '../../src/domains/notifications/services/email.services.js';
import { emailQueue } from '../../src/domains/notifications/queues/email.queue.js';

jest.mock('../../src/domains/notifications/queues/email.queue.js', () => ({
  emailQueue: {
    add: jest.fn(),
  },
}));

describe('Email Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendRecoveryEmail', () => {
    it('should add a job to the emailQueue with correct data', async () => {
      const email = 'test@example.com';
      const code = '123456';

      await sendRecoveryEmail(email, code);

      expect(emailQueue.add).toHaveBeenCalledWith('send-recovery-email', expect.objectContaining({
        to: email,
        subject: 'Código de recuperación',
      }));
      expect(emailQueue.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should add a welcome job to the emailQueue with correct data', async () => {
      const email = 'test@example.com';

      await sendWelcomeEmail(email);

      expect(emailQueue.add).toHaveBeenCalledWith('send-welcome-email', expect.objectContaining({
        to: email,
        subject: '¡Bienvenido!',
      }));
      expect(emailQueue.add).toHaveBeenCalledTimes(1);
    });
  });
});
