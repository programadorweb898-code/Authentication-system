import bcrypt from 'bcryptjs';
import User from '../models/user.models.js';
import { sendRecoverySMS } from '../notifications/sms.services.js';
import { sendRecoveryEmail } from '../notifications/email.services.js';

export const recoveryRequest = async ({ method, email, phone }) => {
  let user;
  if (method === 'email') {
    user = await User.findOne({ email });
  }
  if (method === 'sms') {
    user = await User.findOne({ phone });
  }
  if (!user) {
    return {
      message: 'si existe el usuario,se envia un email',
    };
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashCode = await bcrypt.hash(code, 10);
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.recoveryCode = hashCode;
  user.recoveryCodeExpires = expires;
  user.recoveryAttempts = 0;
  user.recoveryMethod = method;

  await user.save();

  if (method === 'email') {
    await sendRecoveryEmail(user.email, code);
  }

  if (method === 'sms') {
    await sendRecoverySMS(user.phone, code);
  }

  return {
    message: 'Enlace de recuperación enviado correctamente',
  };
};

export const verifyRecoveryCode = async ({ method, email, phone, code }) => {
  let user;
  if (method === 'email') {
    user = await User.findOne({ email });
  }
  if (method === 'sms') {
    user = await User.findOne({ phone });
  }

  if (!user) {
    const error = new Error('codigo invalido');
    error.statusCode = 400;
    throw error;
  }

  if (!user.recoveryCode || !user.recoveryCodeExpires) {
    const error = new Error('No tiene recuperación activa');
    error.statusCode = 400;
    throw error;
  }

  if (user.recoveryCodeExpires < Date.now()) {
    const error = new Error('código expirado');
    error.statusCode = 400;
    throw error;
  }

  if (user.recoveryAttempts >= 2) {
    const error = new Error('Demasiados intentos');
    error.statusCode = 429;
    throw error;
  }

  const isMatch = await bcrypt.compare(code, user.recoveryCode);
  if (!isMatch) {
    user.recoveryAttempts += 1;
    await user.save();
    const error = new Error('Código invalido');
    error.statusCode = 400;
    throw error;
  }

  user.recoveryAttempts = 0;
  await user.save();

  return {
    message: 'Código verificado correctamente',
  };
};

export const resetPassword = async (
  method,
  phone,
  email,
  code,
  newPassword,
) => {
  let user;
  if (method === 'email') {
    user = await User.findOne({ email });
  }

  if (method === 'sms') {
    user = await User.findOne({ phone });
  }

  if (!user) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 400;
    throw error;
  }

  if (!user.recoveryCode || !user.recoveryCodeExpires) {
    const error = new Error('No hay recuepración activa');
    error.statusCode = 400;
    throw error;
  }

  if (user.recoveryCodeExpires < Date.now()) {
    const error = new Error('codigo expirado');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(code, user.recoveryCode);
  if (!isMatch) {
    const error = new Error('código inválido');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;

  user.recoveryCode = null;
  user.recoveryCodeExpires = null;
  user.recoveryMethod = null;
  user.recoveryAttempts = 0;
  user.refreshToken = null;
  await user.save();

  return {
    message: 'Contraseña actualizada correctamente',
  };
};
