import { sendEmail } from '@domains/notifications/adapters/email/resend.adapter.js';
import { Resend } from 'resend';

const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

describe('Resend Adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call resend.emails.send with correct parameters', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<h1>Test</h1>'
    };

    mockSend.mockResolvedValueOnce({ id: '123' });

    await sendEmail(emailData);

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      from: process.env.RESEND_FROM_EMAIL
    }));
  });

  it('should throw an error if resend fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('API failure'));

    await expect(sendEmail({ to: 'test@example.com' })).rejects.toThrow('Failed to send email via Resend');
  });
});
