import { sendEmail } from '../adapters/email/resend.adapter.js';

export const sendRecoveryEmail = async (email, code) => {
  try {
    return await sendEmail({
      to: email,
      subject: 'Código de recuperación',
      html: `
        <h1>Recuperación</h1>
        <p>Tu código OTP es:</p>
        <h2>${code}</h2>
        <p>Expira en 10 minutos</p>
      `,
    });
  } catch (error) {
    console.error('Error al enviar el email de recuperación:', error);
    const customError = new Error(
      'No se pudo enviar el correo de recuperación',
    );
    customError.statusCode = 500;
    throw customError;
  }
};
