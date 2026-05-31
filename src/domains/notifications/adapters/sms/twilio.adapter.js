import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export const sendSMS = async ({ to, body }) => {
  try {
    return await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (error) {
    console.error('Error in TwilioAdapter:', error);
    throw new Error('Failed to send SMS via Twilio', { cause: error });
  }
};
