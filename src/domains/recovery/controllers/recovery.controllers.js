import { getRecoveryService } from '../../../factory.js';

export const recoveryRequestControllers = async (req, res, next) => {
  try {
    const recoveryService = await getRecoveryService();
    const result = await recoveryService.recoveryRequest(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyCodeControllers = async (req, res, next) => {
  try {
    const recoveryService = await getRecoveryService();
    const result = await recoveryService.verifyRecoveryCode(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPasswordControllers = async (req, res, next) => {
  try {
    const recoveryService = await getRecoveryService();
    const result = await recoveryService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
