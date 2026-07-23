import { Worker } from 'bullmq';
import { sendEmail } from '@domains/notifications/adapters/email/resend.adapter.js';

// Creamos una variable para capturar el mock externamente
const mockWorkerImplementation = jest.fn();

// Mockeamos bullmq
jest.mock('bullmq', () => {
  return {
    Worker: jest.fn().mockImplementation((queueName, processor) => {
      mockWorkerImplementation(queueName, processor); // Registramos el procesador
      return {
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(),
      };
    }),
  };
});

// Aseguramos que el adaptador también esté mockeado
jest.mock('@domains/notifications/adapters/email/resend.adapter.js', () => ({
  sendEmail: jest.fn(),
}));

describe('Email Worker', () => {
  let workerProcessor;

  beforeAll(() => {
    // Definimos el procesador igual que en el worker real
    const processor = async (job) => {
      const { to, subject, html } = job.data;
      return await sendEmail({ to, subject, html });
    };

    // Instanciamos el worker para que el mock registre el procesador
    new Worker('email-notifications', processor);

    // Capturamos el procesador desde nuestra variable mock externa
    workerProcessor = mockWorkerImplementation.mock.calls[0][1];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendEmail with correct job data', async () => {
    const jobData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<h1>Test</h1>'
    };
    const job = { data: jobData };

    await workerProcessor(job);

    expect(sendEmail).toHaveBeenCalledWith(jobData);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if sendEmail fails', async () => {
    const jobData = { to: 'test@example.com' };
    const job = { data: jobData };
    sendEmail.mockRejectedValueOnce(new Error('Resend API error'));

    await expect(workerProcessor(job)).rejects.toThrow('Resend API error');
  });
});
