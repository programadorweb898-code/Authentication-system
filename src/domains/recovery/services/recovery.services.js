import bcrypt from 'bcryptjs';
import User from '../../users/models/user.models.js';
import { sendRecoverySMS } from '../../notifications/services/sms.services.js';
import { sendRecoveryEmail } from '../../notifications/services/email.services.js';

export const recoveryRequest = async ({ method, email, phone }) => {
  let user;
  if (method === 'email') {
    user = await User.findOne({ email });
  } else if (method === 'sms') {
    user = await User.findOne({ phone });
  } else {
    const error = new Error('Método de recuperación inválido');
    error.statusCode = 400;
    throw error;
  }

  if (!user) {
    // Mitigación de timing attack
    await bcrypt.hash('fake-code', 10);
    return {
      message: 'Si el usuario existe, se enviará un código de recuperación',
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
    sendRecoveryEmail(user.email, code).catch((err) =>
      console.error('Error enviando email:', err),
    );
  }

  if (method === 'sms') {
    sendRecoverySMS(user.phone, code).catch((err) =>
      console.error('Error enviando SMS:', err),
    );
  }

  return {
    message: 'Código de recuperación enviado correctamente',
  };
};

export const verifyRecoveryCode = async ({ method, email, phone, code }) => {
  let user;
  if (method === 'email') {
    user = await User.findOne({ email });
  } else if (method === 'sms') {
    user = await User.findOne({ phone });
  }

  if (!user) {
    const error = new Error('Código inválido');
    error.statusCode = 400;
    throw error;
  }

  if (!user.recoveryCode || !user.recoveryCodeExpires) {
    const error = new Error('No hay una solicitud de recuperación activa');
    error.statusCode = 400;
    throw error;
  }

  if (user.recoveryCodeExpires < Date.now()) {
    const error = new Error('El código ha expirado');
    error.statusCode = 400;
    throw error;
  }

  if (user.recoveryAttempts >= 3) {
    const error = new Error('Demasiados intentos. Solicite un nuevo código');
    error.statusCode = 429;
    throw error;
  }

  const isMatch = await bcrypt.compare(code, user.recoveryCode);
  if (!isMatch) {
    user.recoveryAttempts += 1;
    await user.save();
    const error = new Error('Código inválido');
    error.statusCode = 400;
    throw error;
  }

  // Código verificado, no lo limpiamos aún para permitir el reset
  return {
    message: 'Código verificado correctamente',
  };
};

export const resetPassword = async ({
  method,
  phone,
  email,
  code,
  newPassword,
}) => {
  let user;
  if (method === 'email') {
    user = await User.findOne({ email });
  } else if (method === 'sms') {
    user = await User.findOne({ phone });
  }

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 400;
    throw error;
  }

  if (!user.recoveryCode || !user.recoveryCodeExpires) {
    const error = new Error('No hay una solicitud de recuperación activa');
    error.statusCode = 400;
    throw error;
  }

  if (user.recoveryCodeExpires < Date.now()) {
    const error = new Error('El código ha expirado');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(code, user.recoveryCode);
  if (!isMatch) {
    const error = new Error('Código inválido');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.recoveryCode = null;
  user.recoveryCodeExpires = null;
  user.recoveryMethod = null;
  user.recoveryAttempts = 0;
  user.refreshTokens = []; // Invalidamos todas las sesiones anteriores por seguridad
  await user.save();

  return {
    message: 'Contraseña actualizada correctamente',
  };
};
