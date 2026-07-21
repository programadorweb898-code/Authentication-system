import { Worker } from 'bullmq';
import { sendEmail } from '@domains/notifications/adapters/email/resend.adapter.js';

// Mockeamos las dependencias
jest.mock('bullmq');
jest.mock('@domains/notifications/adapters/email/resend.adapter.js', () => ({
  sendEmail: jest.fn(),
}));

describe('Email Worker', () => {
  let workerProcessor;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Capturamos la función procesadora que el worker recibe al ser instanciado
    workerProcessor = Worker.mock.calls[0][1];
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
