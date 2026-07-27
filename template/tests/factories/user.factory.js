import bcrypt from 'bcryptjs';
import { getRepositories } from '../../src/factory.js';

export const createUser = async (overrides = {}) => {
  const rawPassword = overrides.password || 'Password123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const { userRepository } = await getRepositories();

  const { password: _omitted, ...restOverrides } = overrides;

  const userData = {
    email: `test-${Date.now()}@example.com`,
    isVerified: true,
    ...restOverrides,
    password: hashedPassword,
  };

  return await userRepository.create(userData);
};
