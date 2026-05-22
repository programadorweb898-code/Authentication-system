import User from '../../src/models/user.models.js';
import bcrypt from 'bcryptjs';

export const createUser = async (overrides = {}) => {
  const defaultData = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
  };
  
  const userData = { ...defaultData, ...overrides };
  
  // Si el password no está hasheado, lo hasheamos (asumiendo que el modelo no lo hace automáticamente o queremos control)
  // Nota: En un sistema real el modelo suele tener un pre-save hook. 
  // Pero aquí crearemos el usuario directamente.
  
  const user = new User(userData);
  await user.save();
  return user;
};
