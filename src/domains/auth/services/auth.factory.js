import { AuthService } from './auth.service.js';
import MongoUserRepository from '../../../infrastructure/persistence/mongodb/user.repository.js';
import MongoTokenBlacklistRepository from '../../../infrastructure/persistence/mongodb/token_blacklist.repository.js';
import { PostgresUserRepository } from '../../../infrastructure/persistence/postgres/user.repository.js';
import { PostgresTokenBlacklistRepository } from '../../../infrastructure/persistence/postgres/token_blacklist.repository.js';
import { BCryptPasswordHasher } from '../../../infrastructure/services/bcrypt_password_hasher.js';
import { JWTTokenService } from '../../../infrastructure/services/jwt_token_service.js';
import { sendRecoveryEmail, sendWelcomeEmail } from '../../notifications/services/email.services.js';
import { sendRecoverySMS } from '../../notifications/services/sms.services.js';
import { AppDataSource } from '../../../infrastructure/persistence/postgres/data-source.js';

let instance = null;
const initializePostgres = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
};

export const getAuthService = async (overrides = {}) => {
  if (instance && Object.keys(overrides).length === 0) {
    return instance;
  }

  const dbType = process.env.DB_TYPE || 'postgres';

  let userRepository;
  let tokenBlacklistRepository;

  if (dbType === 'mongo') {
      userRepository = overrides.userRepository || new MongoUserRepository();
      tokenBlacklistRepository = overrides.tokenBlacklistRepository || new MongoTokenBlacklistRepository();
  } else {
      await initializePostgres();
      userRepository = overrides.userRepository || new PostgresUserRepository();
      tokenBlacklistRepository = overrides.tokenBlacklistRepository || new PostgresTokenBlacklistRepository();
  }

  const passwordHasher = overrides.passwordHasher || new BCryptPasswordHasher();
  const tokenService = overrides.tokenService || new JWTTokenService();
  const emailService = overrides.emailService || { sendRecoveryEmail, sendWelcomeEmail };
  const smsService = overrides.smsService || { sendRecoverySMS };

  const newInstance = new AuthService(
    userRepository,
    tokenBlacklistRepository,
    passwordHasher,
    tokenService,
    emailService,
    smsService
  );

  if (Object.keys(overrides).length === 0) {
    instance = newInstance;
  }

  return newInstance;
};
