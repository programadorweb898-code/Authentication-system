import { body } from 'express-validator';

export const validationCreateStore = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser booleano'),
  body('isPickupAvailable')
    .optional()
    .isBoolean()
    .withMessage('isPickupAvailable debe ser booleano'),
];

export const validationUpdateStore = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacía'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La ciudad no puede estar vacía'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser booleano'),
  body('isPickupAvailable')
    .optional()
    .isBoolean()
    .withMessage('isPickupAvailable debe ser booleano'),
];
