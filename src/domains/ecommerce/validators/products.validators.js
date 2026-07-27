import { body } from 'express-validator';

export const validationCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ gt: 0 })
    .withMessage('El precio debe ser un número mayor a 0'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
];

export const validationUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('El precio debe ser un número mayor a 0'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La categoría no puede estar vacía'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
];

export const validationCreateOrder = [
  body('deliveryMethod')
    .trim()
    .notEmpty()
    .withMessage('El método de entrega es requerido')
    .isIn(['shipping', 'pickup'])
    .withMessage('El método de entrega debe ser shipping o pickup'),
  body('shippingAddressId')
    .if(body('deliveryMethod').equals('shipping'))
    .notEmpty()
    .withMessage('La dirección de envío es requerida')
    .isUUID()
    .withMessage('shippingAddressId debe ser un UUID válido'),
  body('storeId')
    .if(body('deliveryMethod').equals('pickup'))
    .notEmpty()
    .withMessage('El local de retiro es requerido')
    .isUUID()
    .withMessage('storeId debe ser un UUID válido'),
];

export const validationAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('El productId es requerido')
    .isInt({ gt: 0 })
    .withMessage('El productId debe ser un número entero positivo'),
  body('quantity')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
];
