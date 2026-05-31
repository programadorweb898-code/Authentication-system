import {
  recoveryRequest,
  verifyRecoveryCode,
  resetPassword,
} from '../services/recovery.services.js';

export const recoveryRequestControllers = async (req, res, next) => {
  try {
    const result = await recoveryRequest(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyCodeControllers = async (req, res, next) => {
  try {
    const result = await verifyRecoveryCode(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPasswordControllers = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);
    // Nota: Como esta ruta es pública, no tenemos el access token del usuario.
    // La revocación se maneja invalidando el refresh token en resetPassword (ya hecho en el servicio).
    res.json(result);
  } catch (err) {
    next(err);
  }
};
