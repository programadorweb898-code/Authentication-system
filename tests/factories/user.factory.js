import { getAuthService } from '../../src/domains/auth/services/auth.factory.js';

export const createUser = async (overrides = {}) => {
  const authService = await getAuthService();
  const userRepository = authService.userRepository;
  
  const defaultData = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    isVerified: true
  };

  const userData = { ...defaultData, ...overrides };

  // Usamos el repositorio para crear el usuario, garantizando compatibilidad con cualquier DB
  return await userRepository.create(userData);
};
