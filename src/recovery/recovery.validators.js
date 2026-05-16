import { body } from 'express-validator';

const methodValidation=body('method')
    .trim()
    .notEmpty().withMessage('El método es requerido')
    .isIn(['sms', 'email']).withMessage('metodo invalido')
    
  const emailValidation=body('email')
    .if(body('method').equals('emaio'))
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Formato invalido')
    
  const phoneValidation=body('phone')
    .if(body('method').equals('sms'))
    .trim()
    .notEmpty('El telefóno es requerido')
    
  const codeValidation=body('code')
    .trim()
    .notEmpty()
    .withMessage('El cód8go es requerido')
    .isLength({ min: 6, max: 6 })
    .withMessage('Debe conrener 6 caracteres')
    .isNumeric()
    .withMessage('Debe contener valores numéricos')
  
  const newPasswordValidation=body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('Completar este campo')
    .isLength({ min: 8, max: 20 })
    .withMessage('Debe contener entre 8 y 20 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/)
    .withMessage('Formato invalido');
    
export const recoveryValidation = [
  methodValidation,emailValidation,phoneValidation
  ];
  
export const verifyCodeValidation=[
    methodValidation,emailValidation,phoneValidation,codeValidation,
  ];
  
export const passwordValidation=[
    methodValidation,emailValidation,phoneValidation,codeValidation,newPasswordValidation
  ];
