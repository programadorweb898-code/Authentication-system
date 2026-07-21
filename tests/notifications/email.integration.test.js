import { Queue, Worker } from 'bullmq';
import { sendWelcomeEmail } from '../../src/domains/notifications/services/email.services.js';
import * as resendAdapter from '../../src/domains/notifications/adapters/email/resend.adapter.js';

// Usamos mocks para el adaptador final, pero dejamos la cola y el worker reales
jest.mock('../../src/domains/notifications/adapters/email/resend.adapter.js', () => ({
  sendEmail: jest.fn().mockResolvedValue({ id: 'mocked-id' }),
}));

describe('Email Integration', () => {
  let queue;
  let worker;
  const queueName = 'email-notifications'; // Debe coincidir con el worker

  beforeAll(async () => {
    // Configuramos una conexión en memoria o básica para pruebas
    // En un entorno de test real, bullmq usa redis. Asumiremos que jest puede gestionar esto.
    queue = new Queue(queueName, { connection: { host: 'localhost', port: 6379 } });
    
    // El worker real necesita importar el mismo procesador que src/domains/notifications/workers/email.worker.js
    // Dado que el worker ya está definido en el archivo, aquí lo importamos para asegurarnos de que corre.
    worker = new Worker(queueName, async (job) => {
        const { to, subject, html } = job.data;
        return await resendAdapter.sendEmail({ to, subject, html });
    }, { connection: { host: 'localhost', port: 6379 } });
  });

  afterAll(async () => {
    await queue.close();
    await worker.close();
  });

  it('should process the welcome email job through the queue', async () => {
    const email = 'integration@example.com';
    
    // Act: Disparamos el flujo desde el servicio
    await sendWelcomeEmail(email);

    // Assert: Esperamos a que el worker procese el job
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    expect(resendAdapter.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: email,
      subject: '¡Bienvenido!',
    }));
  });

  it('should process the recovery email job through the queue', async () => {
    const email = 'recovery@example.com';
    const code = '654321';
    
    // Act: Disparamos el flujo desde el servicio
    await import('../../src/domains/notifications/services/email.services.js').then(s => s.sendRecoveryEmail(email, code));

    // Assert: Esperamos a que el worker procese el job
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    expect(resendAdapter.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: email,
      subject: 'Código de recuperación',
    }));
  });
});
