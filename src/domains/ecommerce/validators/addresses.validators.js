import { body } from 'express-validator';

export const validationCreateAddress = [
  body('street').trim().notEmpty().withMessage('La calle es requerida'),
  body('city').trim().notEmpty().withMessage('La ciudad es requerida'),
  body('state').trim().notEmpty().withMessage('La provincia/estado es requerida'),
  body('postalCode').trim().notEmpty().withMessage('El código postal es requerido'),
  body('country').trim().notEmpty().withMessage('El país es requerido'),
  body('isDefault').optional().isBoolean().withMessage('isDefault debe ser booleano'),
];

export const validationUpdateAddress = [
  body('street').optional().trim().notEmpty().withMessage('La calle no puede estar vacía'),
  body('city').optional().trim().notEmpty().withMessage('La ciudad no puede estar vacía'),
  body('state').optional().trim().notEmpty().withMessage('La provincia/estado no puede estar vacía'),
  body('postalCode').optional().trim().notEmpty().withMessage('El código postal no puede estar vacío'),
  body('country').optional().trim().notEmpty().withMessage('El país no puede estar vacío'),
  body('isDefault').optional().isBoolean().withMessage('isDefault debe ser booleano'),
];
