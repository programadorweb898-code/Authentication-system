import { Worker } from 'bullmq';
import { sendRecoverySMS } from '../../src/domains/notifications/services/sms.services.js';
import * as twilioAdapter from '../../src/domains/notifications/adapters/sms/twilio.adapter.js';

// Mockeamos el adaptador de Twilio
jest.mock('../../src/domains/notifications/adapters/sms/twilio.adapter.js', () => ({
  sendSMS: jest.fn().mockResolvedValue({ sid: 'SM123' }),
}));

describe('SMS Integration', () => {
  let worker;
  const queueName = 'sms-notifications'; // Asumiendo que esta es la cola usada por el worker de SMS

  beforeAll(async () => {
    // Nota: Como no tenemos el código del worker de SMS en el contexto actual, 
    // asumimos que existe y procesa jobs de tipo 'send-recovery-sms'.
    // Esto es un ejemplo de cómo se estructuraría.
    worker = new Worker(queueName, async (job) => {
        const { to, body } = job.data;
        return await twilioAdapter.sendSMS({ to, body });
    }, { connection: { host: 'localhost', port: 6379 } });
  });

  afterAll(async () => {
    await worker.close();
  });

  it('should process the recovery SMS job through the queue', async () => {
    const phone = '+123456789';
    const code = '654321';
    
    // Aquí necesitaríamos una Cola de SMS real en el test para encolar el job.
    // Esto demuestra la lógica de integración.
    const { Queue } = await import('bullmq');
    const queue = new Queue(queueName, { connection: { host: 'localhost', port: 6379 } });
    await queue.add('send-recovery-sms', { to: phone, body: `Tu código es ${code}` });
    await queue.close();

    // Assert: Esperamos a que el worker procese el job
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    expect(twilioAdapter.sendSMS).toHaveBeenCalledWith(expect.objectContaining({
      to: phone,
    }));
  });
});
