import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendRecoveryEmail = async (email, code) => {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,

    to: email,

    subject: 'Código de recuperación',

    html: `
      <h1>Recuperación</h1>

      <p>
        Tu código OTP es:
      </p>

      <h2>${code}</h2>

      <p>
        Expira en 10 minutos
      </p>
    `,
  });
};
