import {
  recoveryRequest,
  verifyRecoveryCode,
  resetPassword,
} from './recovery.services.js';

export const recoveryControllers = async (req, res, next) => {
  const { method, email, phone } = req.body;
  try {
    const result = await recoveryRequest({ method, email, phone });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyCodeControllers = async (req, res, next) => {
  const { method, phone, email, code } = req.body;
  try {
    const result = await verifyRecoveryCode(method, phone, email, code);
    res.json({ message: result });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req, res, next) => {
  const { method, email, phone, code, newPassword } = req.body;
  try {
    const result = await resetPassword({
      method,
      email,
      phone,
      code,
      newPassword,
    });
    res.json({ result });
  } catch (err) {
    next(err);
  }
};
