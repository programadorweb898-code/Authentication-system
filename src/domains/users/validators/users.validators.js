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
