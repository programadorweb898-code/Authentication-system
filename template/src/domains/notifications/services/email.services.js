import { emailQueue } from '../queues/email.queue.js';

export const sendRecoveryEmail = async (email, code) => {
  try {
    await emailQueue.add('send-recovery-email', {
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
    console.error('Error al encolar el email de recuperación:', error);
    const customError = new Error(
      'No se pudo encolar el correo de recuperación',
    );
    customError.statusCode = 500;
    throw customError;
  }
};

export const sendWelcomeEmail = async (email) => {
  const jobData = {
    to: email,
    subject: '¡Bienvenido!',
    html: `
      <h1>¡Bienvenido a nuestra plataforma!</h1>
      <p>Estamos muy felices de tenerte con nosotros.</p>
    `,
  };
  console.log('--- DEBUG: Llamando emailQueue.add con:', jobData, '---');
  try {
    await emailQueue.add('send-welcome-email', jobData);
  } catch (error) {
    console.error('Error al encolar el email de bienvenida:', error);
    const customError = new Error('No se pudo encolar el correo de bienvenida');
    customError.statusCode = 500;
    throw customError;
  }
};
