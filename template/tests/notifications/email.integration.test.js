import { sendWelcomeEmail, sendRecoveryEmail } from '../../src/domains/notifications/services/email.services.js';
import * as resendAdapter from '../../src/domains/notifications/adapters/email/resend.adapter.js';
import { emailQueue } from '../../src/domains/notifications/queues/email.queue.js';
import { processEmailJob } from '../../src/domains/notifications/workers/email.worker.js';

jest.mock('../../src/domains/notifications/adapters/email/resend.adapter.js', () => ({
  sendEmail: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
}));

jest.mock('../../src/domains/notifications/queues/email.queue.js', () => ({
  emailQueue: {
    add: jest.fn(),
  },
}));

describe('Email Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar el mock de emailQueue.add para que procese el job
    emailQueue.add.mockImplementation(async (name, data) => {
      await processEmailJob({ data });
      return { id: 'job-id' };
    });
  });

  it('should process the welcome email job through the queue', async () => {
    const email = 'integration@example.com';
    
    // Act: Disparamos el flujo desde el servicio
    await sendWelcomeEmail(email);

    // Assert: Verificamos que el adaptador fue llamado
    expect(resendAdapter.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: email,
      subject: '¡Bienvenido!',
    }));
  });

  it('should process the recovery email job through the queue', async () => {
    const email = 'recovery@example.com';
    const code = '654321';
    
    // Act: Disparamos el flujo desde el servicio
    await sendRecoveryEmail(email, code);

    // Assert: Verificamos que el adaptador fue llamado
    expect(resendAdapter.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: email,
      subject: 'Código de recuperación',
    }));
  });
});
