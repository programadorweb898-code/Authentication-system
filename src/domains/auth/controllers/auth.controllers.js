import jwt from 'jsonwebtoken';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyAccount,
  resendVerificationCode,
  googleAuthSuccess,
  changePassword,
  revokeToken,
} from '../services/auth.services.js';

export const registerControllers = async (req, res, next) => {
  try {
    const response = await registerUser(req.body);
    return res.status(201).json(response);
  } catch (err) {
    return next(err);
  }
};

export const verifyAccountController = async (req, res, next) => {
  try {
    const response = await verifyAccount(req.body);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const resendVerificationCodeController = async (req, res, next) => {
  try {
    const response = await resendVerificationCode(req.body);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const loginControllers = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshTokenControllers = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await refreshAccessToken(
      req.cookies.refreshToken,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutControllers = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await revokeToken(token);
    }
    await logoutUser(req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    return next(err);
  }
};

export const googleAuthCallbackController = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await googleAuthSuccess(req.user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // En un entorno real, redirigirías a tu frontend con los tokens.
    // Por ahora, enviamos una respuesta JSON o redirigimos a una página de éxito.
    res.status(200).json({
      message: 'Autenticación con Google exitosa',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const response = await changePassword(req.user.id, req.body);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await revokeToken(token);
    }
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const revokeTokenController = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      const error = new Error('Token requerido');
      error.statusCode = 400;
      throw error;
    }

    // Decodificar el token para verificar propiedad
    const decoded = jwt.decode(token);
    
    // Si no es admin, verificar que el dueño del token es el usuario autenticado
    if (req.user.role !== 'admin' && decoded?.id !== req.user.id) {
      const error = new Error('No tienes permiso para revocar este token');
      error.statusCode = 403;
      throw error;
    }

    await revokeToken(token);
    return res.status(200).json({ message: 'Token revocado correctamente' });
  } catch (err) {
    return next(err);
  }
};
