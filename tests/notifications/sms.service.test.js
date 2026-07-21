import { sendRecoverySMS } from '../../src/domains/notifications/services/sms.services.js';
import { sendSMS } from '../../src/domains/notifications/adapters/sms/twilio.adapter.js';

jest.mock('../../src/domains/notifications/adapters/sms/twilio.adapter.js');

describe('SMS Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendRecoverySMS', () => {
    it('should call sendSMS with correct data', async () => {
      const phone = '+123456789';
      const code = '123456';

      sendSMS.mockResolvedValueOnce({ sid: 'SM123' });

      await sendRecoverySMS(phone, code);

      expect(sendSMS).toHaveBeenCalledWith(expect.objectContaining({
        to: phone,
        body: expect.stringContaining(code),
      }));
    });

    it('should throw an error if sendSMS fails', async () => {
      sendSMS.mockRejectedValueOnce(new Error('Twilio error'));

      await expect(sendRecoverySMS('+123456789', '123456')).rejects.toThrow(
        'No se pudo enviar el SMS de recuperación'
      );
    });
  });
});
