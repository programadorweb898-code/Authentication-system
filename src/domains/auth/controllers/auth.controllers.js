import { getAuthService } from '../services/auth.factory.js';

const getService = async () => await getAuthService();

export const registerControllers = async (req, res, next) => {
  try {
    const authService = await getService();
    const response = await authService.registerUser(req.body);
    return res.status(201).json(response);
  } catch (err) {
    return next(err);
  }
};

export const verifyAccountController = async (req, res, next) => {
  try {
    const authService = await getService();
    const response = await authService.verifyAccount(req.body);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const resendVerificationCodeController = async (req, res, next) => {
  try {
    const authService = await getService();
    const response = await authService.resendVerificationCode(req.body);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const loginControllers = async (req, res, next) => {
  try {
    const authService = await getService();
    const result = await authService.loginUser(req.body);

    if (result.mfaRequired) {
      return res.status(200).json({
        message: 'MFA requerido',
        mfaRequired: true,
        mfaToken: result.mfaToken,
      });
    }

    const { accessToken, refreshToken, user } = result;

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
    const authService = await getService();
    const { accessToken, refreshToken } = await authService.refreshAccessToken(
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
    const authService = await getService();
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await authService.revokeToken(token);
    }
    await authService.logoutUser(req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    return next(err);
  }
};

export const googleAuthCallbackController = async (req, res, next) => {
  try {
    const authService = await getService();
    const { accessToken, refreshToken, user } = await authService.googleAuthSuccess(req.user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
    const authService = await getService();
    const response = await authService.changePassword(req.user.id, req.body);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await authService.revokeToken(token);
    }
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
};

export const revokeTokenController = async (req, res, next) => {
  try {
    const authService = await getService();
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      const error = new Error('Token requerido');
      error.statusCode = 400;
      throw error;
    }

    const decoded = authService.tokenService.decode(token);
    
    if (req.user.role !== 'admin' && decoded?.id !== req.user.id) {
      const error = new Error('No tienes permiso para revocar este token');
      error.statusCode = 403;
      throw error;
    }

    await authService.revokeToken(token);
    return res.status(200).json({ message: 'Token revocado correctamente' });
  } catch (err) {
    return next(err);
  }
};

export const verify2FAController = async (req, res, next) => {
  try {
    const authService = await getService();
    const { mfaToken, code } = req.body;
    const { accessToken, refreshToken, user } = await authService.verifyMFA(mfaToken, code);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const setup2FAController = async (req, res, next) => {
  try {
    return res.status(200).json({ message: 'Setup 2FA endpoint' });
  } catch (err) {
    return next(err);
  }
};

export const disable2FAController = async (req, res, next) => {
  try {
    return res.status(200).json({ message: 'Disable 2FA endpoint' });
  } catch (err) {
    return next(err);
  }
};
