import { Worker } from 'bullmq';
import { connection } from '../../../../infrastructure/redis.js';
import { sendEmail } from '../adapters/email/resend.adapter.js';

export const processEmailJob = async (job) => {
  const { to, subject, html } = job.data;
  console.log(`Procesando envío de email a: ${to}`);
  return await sendEmail({ to, subject, html });
};

let emailWorker;
if (process.env.NODE_ENV !== 'test') {
  emailWorker = new Worker(
    'email-notifications',
    processEmailJob,
    { connection }
  );

  emailWorker.on('completed', (job) => {
    console.log(`Email enviado exitosamente para el job: ${job.id}`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`Error enviando email en el job ${job.id}:`, err);
  });
}

export { emailWorker };
