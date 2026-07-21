import { sendEmail } from '../../../src/domains/notifications/adapters/email/resend.adapter.js';
import { Resend } from 'resend';

// Mockeamos la librería resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('Resend Adapter', () => {
  let mockResend;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResend = new Resend();
  });

  it('should call resend.emails.send with correct parameters', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<h1>Test</h1>'
    };

    mockResend.emails.send.mockResolvedValueOnce({ id: '123' });

    await sendEmail(emailData);

    expect(mockResend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      from: process.env.RESEND_FROM_EMAIL
    }));
  });

  it('should throw an error if resend fails', async () => {
    mockResend.emails.send.mockRejectedValueOnce(new Error('API failure'));

    await expect(sendEmail({ to: 'test@example.com' })).rejects.toThrow('Failed to send email via Resend');
  });
});
