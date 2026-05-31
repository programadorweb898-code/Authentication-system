import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error in ResendAdapter:', error);
    throw new Error('Failed to send email via Resend', { cause: error });
  }
};
