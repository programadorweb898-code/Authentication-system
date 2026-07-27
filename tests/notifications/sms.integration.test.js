import { Queue, Worker } from 'bullmq';
import * as twilioAdapter from '@domains/notifications/adapters/sms/twilio.adapter.js';

// Mockeamos el adaptador de Twilio
jest.mock('@domains/notifications/adapters/sms/twilio.adapter.js', () => ({
  sendSMS: jest.fn().mockResolvedValue({ sid: 'SM123' }),
}));

describe('SMS Integration', () => {
  let worker;
  const queueName = 'sms-notifications'; // Asumiendo que esta es la cola usada por el worker de SMS

  beforeAll(async () => {
    worker = new Worker(queueName, async (job) => {
        const { to, body } = job.data;
        return await twilioAdapter.sendSMS({ to, body });
    });
  });

  afterAll(async () => {
    await worker.close();
  });

  it('should process the recovery SMS job through the queue', async () => {
    const phone = '+123456789';
    const code = '654321';
    
    const queue = new Queue(queueName);
    
    await queue.add('send-recovery-sms', { to: phone, body: `Tu código es ${code}` });
    await queue.close();

    // Assert: Esperamos a que el worker procese el job
    await new Promise((resolve) => setTimeout(resolve, 500)); 

    expect(twilioAdapter.sendSMS).toHaveBeenCalledWith(expect.objectContaining({
      to: phone,
    }));
  });
});
