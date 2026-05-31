import { body } from 'express-validator';

const methodValidation = body('method')
  .trim()
  .notEmpty()
  .withMessage('El método es requerido')
  .isIn(['sms', 'email'])
  .withMessage('metodo invalido');

const emailValidation = body('email')
  .if(body('method').equals('email'))
  .trim()
  .notEmpty()
  .withMessage('El email es requerido')
  .isEmail()
  .withMessage('Formato invalido');

const phoneValidation = body('phone')
  .if(body('method').equals('sms'))
  .trim()
  .notEmpty()
  .withMessage('El telefóno es requerido');

const codeValidation = body('code')
  .trim()
  .notEmpty()
  .withMessage('El código es requerido')
  .isLength({ min: 6, max: 6 })
  .withMessage('Debe contener 6 caracteres')
  .isNumeric()
  .withMessage('Debe contener valores numéricos');

const newPasswordValidation = body('newPassword')
  .trim()
  .notEmpty()
  .withMessage('Completar este campo')
  .isLength({ min: 8, max: 20 })
  .withMessage('Debe contener entre 8 y 20 caracteres')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/)
  .withMessage('Formato invalido');

export const recoveryRequestValidator = [
  methodValidation,
  emailValidation,
  phoneValidation,
];

export const verifyCodeValidator = [
  methodValidation,
  emailValidation,
  phoneValidation,
  codeValidation,
];

export const resetPasswordValidator = [
  methodValidation,
  emailValidation,
  phoneValidation,
  codeValidation,
  newPasswordValidation,
];
