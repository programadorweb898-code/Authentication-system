import User from '../../users/models/user.models.js';
import { TokenBlacklist } from '../../../../domains/auth/models/tokenBlacklist.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendRecoveryEmail, sendWelcomeEmail } from '../../notifications/services/email.services.js';
import { sendRecoverySMS } from '../../notifications/services/sms.services.js';

dotenv.config();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateAndStoreTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' },
  );

  user.refreshTokens.push({ token: refreshToken });

  if (user.refreshTokens.length > 5) {
    user.refreshTokens.shift();
  }
  await user.save();
  return { accessToken, refreshToken };
};

export const registerUser = async ({
  email,
  password,
  phone,
  verificationMethod = 'email',
}) => {
  const code = generateOTP();
  const hashCode = await bcrypt.hash(code, 10);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const newUser = new User({
    email,
    password,
    phone,
    verificationCode: hashCode,
    verificationCodeExpires: expires,
    verificationMethod,
  });

  await newUser.save();

  // Envío asíncrono del código
  if (verificationMethod === 'email') {
    sendRecoveryEmail(email, code).catch((err) =>
      console.error('Error enviando email de verificación:', err),
    );
  } else if (verificationMethod === 'sms' && phone) {
    sendRecoverySMS(phone, code).catch((err) =>
      console.error('Error enviando SMS de verificación:', err),
    );
  }

  return {
    id: newUser._id,
    email: newUser.email,
    message: `Código de verificación enviado vía ${verificationMethod}`,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // 1. Verificar si la cuenta está bloqueada
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const error = new Error(
      'La cuenta está bloqueada temporalmente por demasiados intentos fallidos',
    );
    error.statusCode = 403;
    throw error;
  }

  // 2. Verificar si la cuenta está verificada
  if (!user.isVerified) {
    const error = new Error(
      `Cuenta no verificada. Por favor, verifica tu identidad vía ${user.verificationMethod}`,
    );
    error.statusCode = 403;
    throw error;
  }

  // 3. Comparar contraseñas
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Bloqueo de 30 min
    }
    await user.save();

    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // 4. Login exitoso: Resetear intentos
  user.loginAttempts = 0;
  user.lockUntil = null;

  const { accessToken, refreshToken } = await generateAndStoreTokens(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
    },
  }
  };

  export const googleAuthSuccess = async (user) => {
  if (!user) {
    const error = new Error('Usuario no encontrado después de autenticación de Google');
    error.statusCode = 404;
    throw error;
  }

  const { accessToken, refreshToken } = await generateAndStoreTokens(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
    },
  };
  };

  export const verifyAccount = async ({ identifier, code, method }) => {
  const query =
    method === 'email' ? { email: identifier } : { phone: identifier };
  const user = await User.findOne(query);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    return { message: 'La cuenta ya está verificada' };
  }

  if (!user.verificationCode || user.verificationCodeExpires < Date.now()) {
    const error = new Error('El código ha expirado o es inexistente');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(code, user.verificationCode);
  if (!isMatch) {
    const error = new Error('Código de verificación incorrecto');
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save();

  // Envío asíncrono del email de bienvenida
  if (method === 'email') {
    sendWelcomeEmail(user.email).catch((err) =>
      console.error('Error enviando email de bienvenida:', err),
    );
  }

  return { message: 'Cuenta verificada exitosamente' };
};

export const resendVerificationCode = async ({ identifier, method }) => {
  const query =
    method === 'email' ? { email: identifier } : { phone: identifier };
  const user = await User.findOne(query);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('La cuenta ya está verificada');
    error.statusCode = 400;
    throw error;
  }

  const code = generateOTP();
  user.verificationCode = await bcrypt.hash(code, 10);
  user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  if (method === 'email') {
    await sendRecoveryEmail(user.email, code);
  } else {
    await sendRecoverySMS(user.phone, code);
  }

  return { message: `Nuevo código enviado vía ${method}` };
};

export const refreshAccessToken = async (token) => {
  if (!token) {
    const error = new Error('No autorizado');
    error.statusCode = 401;
    throw error;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    // Verificar si el token existe en la lista de sesiones activas del usuario
    const tokenIndex = user?.refreshTokens.findIndex(
      (rt) => rt.token === token,
    );

    if (!user || tokenIndex === -1) {
      const error = new Error('Token inválido o sesión cerrada');
      error.statusCode = 401;
      throw error;
    }

    const newToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    // Rotación de tokens: reemplazamos el viejo por el nuevo
    user.refreshTokens[tokenIndex].token = newRefreshToken;
    await user.save();

    return { accessToken: newToken, refreshToken: newRefreshToken };
  } catch (err) {
    const error = new Error(
      err.statusCode === 401 ? err.message : 'Sesión expirada o inválida',
    );
    error.statusCode = 401;
    throw error;
  }
};

export const logoutUser = async (token) => {
  if (token) {
    // Buscamos al usuario que tenga ese token específico en su lista
    const user = await User.findOne({ 'refreshTokens.token': token });
    if (user) {
      // Filtramos el array para eliminar solo la sesión actual
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.token !== token,
      );
      await user.save();
    }
  }
};

export const changePassword = async (
  userId,
  { currentPassword, newPassword },
) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Si el usuario se registró con Google y no tiene password, no puede usar este flujo
  // a menos que primero defina una contraseña (que es otro flujo)
  if (!user.password && user.provider === 'google') {
    const error = new Error(
      'Las cuentas registradas con Google no tienen una contraseña local. Por favor, utiliza el flujo de recuperación para establecer una.',
    );
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('La contraseña actual es incorrecta');
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword; // El pre-save hook se encarga del hashing
  user.refreshTokens = []; // Invalidamos todas las sesiones anteriores por seguridad
  await user.save();

  return { message: 'Contraseña actualizada correctamente' };
};

export const revokeToken = async (token) => {
  await TokenBlacklist.create({ token });
};
