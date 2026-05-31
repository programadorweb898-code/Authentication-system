import { sendSMS } from '../adapters/sms/twilio.adapter.js';

export const sendRecoverySMS = async (phone, code) => {
  try {
    return await sendSMS({
      to: phone,
      body: `Tu código de recuperación es: ${code}. Expira en 10 minutos.`,
    });
  } catch (error) {
    console.error('Error al enviar el SMS de recuperación:', error);
    const customError = new Error('No se pudo enviar el SMS de recuperación');
    customError.statusCode = 500;
    throw customError;
  }
};
