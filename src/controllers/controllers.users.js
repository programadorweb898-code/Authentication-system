import {
  registerUser,
  loginUser,
  refreshToken as refreshTokenServices,
  logoutUser,
} from '../services/services.users.js';

export const registerControllers = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await registerUser(email, password);
    return res
      .status(201)
      .json({ message: 'usuario registrado correctsmente', user });
  } catch (err) {
    return next(err);
  }
};

export const loginControllers = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { accessToken, refreshToken } = await loginUser(email, password);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    res.status(201).json({
      message: 'Usuario logueado correctamente',
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshTokenControllers = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await refreshTokenServices(
      req.cookies.refreshToken,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutControllers = async (req, res, next) => {
  try {
    await logoutUser(req.cookies.refreshToken);
    req.clearCookie('refreshToken');
    return res.json({ message: 'logout ok' });
  } catch (err) {
    return next(err);
  }
};
