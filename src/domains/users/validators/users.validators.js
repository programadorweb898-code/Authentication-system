import { body } from 'express-validator';

export const validationLogin = [
  body('email').trim().notEmpty().withMessage('Completar este campo'),
  body('password').trim().notEmpty().withMessage('Completar este campo'),
];

export const validationRegister = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Completar este campo')
    .isEmail()
    .withMessage('Formato no valido'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Completar este campo')
    .isLength({ min: 8, max: 20 })
    .withMessage('Debe contener entre 8 y 20 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/)
    .withMessage('Formato invalido'),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Completar este campo')
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Las conrraseñas no coinciden');
      return true;
    }),
];

export const validationSetupMFA = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('El tipo MFA es requerido')
    .isIn(['app', 'sms'])
    .withMessage('El tipo MFA debe ser "app" o "sms"'),
];

export const validationConfirmMFA = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('El código de verificación es requerido')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos')
    .isNumeric()
    .withMessage('El código debe ser numérico'),
];

export const validationDisableMFA = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

export const validationChangePassword = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8, max: 20 })
    .withMessage('Debe contener entre 8 y 20 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/)
    .withMessage(
      'La contraseña debe tener al menos una mayúscula, una minúscula y un carácter especial',
    ),
  body('confirmNewPassword')
    .trim()
    .notEmpty()
    .withMessage('Debes confirmar la nueva contraseña')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];
