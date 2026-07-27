import MongoUserRepository from './infrastructure/persistence/mongodb/user.repository.js';
import MongoTokenBlacklistRepository from './infrastructure/persistence/mongodb/token_blacklist.repository.js';
import MongoSystemSettingsRepository from './infrastructure/persistence/mongodb/systemSettings.repository.js';
import MongoAuditLogRepository from './infrastructure/persistence/mongodb/auditLog.repository.js';
import MongoProductRepository from './infrastructure/persistence/mongodb/product.repository.js';
import MongoCartItemRepository from './infrastructure/persistence/mongodb/cartItem.repository.js';
import MongoOrderRepository from './infrastructure/persistence/mongodb/order.repository.js';
import { PostgresUserRepository } from './infrastructure/persistence/postgres/user.repository.js';
import { PostgresTokenBlacklistRepository } from './infrastructure/persistence/postgres/token_blacklist.repository.js';
import { PostgresSystemSettingsRepository } from './infrastructure/persistence/postgres/systemSettings.repository.js';
import { PostgresAuditLogRepository } from './infrastructure/persistence/postgres/auditLog.repository.js';
import { PostgresProductRepository } from './infrastructure/persistence/postgres/product.repository.js';
import { PostgresCartItemRepository } from './infrastructure/persistence/postgres/cartItem.repository.js';
import { PostgresOrderRepository } from './infrastructure/persistence/postgres/order.repository.js';
import { AppDataSource } from './infrastructure/persistence/postgres/data-source.js';
import { AuthService } from './domains/auth/services/auth.service.js';
import { UsersService } from './domains/users/services/users.services.js';
import { RecoveryService } from './domains/recovery/services/recovery.services.js';
import { AuditService } from './domains/users/services/audit.services.js';
import { SystemSettingsService } from './domains/shared/services/systemSettings.services.js';
import { ProductService } from './domains/ecommerce/services/products.service.js';
import { CartService } from './domains/ecommerce/cart/services/cart.service.js';
import { OrderService } from './domains/ecommerce/services/orders.service.js';
import { BCryptPasswordHasher } from './infrastructure/services/bcrypt_password_hasher.js';
import { JWTTokenService } from './infrastructure/services/jwt_token_service.js';
import { sendRecoveryEmail, sendWelcomeEmail } from './domains/notifications/services/email.services.js';
import { sendRecoverySMS } from './domains/notifications/services/sms.services.js';

let initialized = false;
let dbType;
let userRepository;
let tokenBlacklistRepository;
let systemSettingsRepository;
let auditLogRepository;
let productRepository;
let cartItemRepository;
let orderRepository;
let authServiceInstance;
let usersServiceInstance;
let recoveryServiceInstance;
let auditServiceInstance;
let systemSettingsServiceInstance;
let productServiceInstance;
let cartServiceInstance;
let orderServiceInstance;

const initializePostgres = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

const init = async () => {
  if (initialized) return;
  dbType = process.env.DB_TYPE || 'postgres';

  if (dbType === 'mongo') {
    userRepository = new MongoUserRepository();
    tokenBlacklistRepository = new MongoTokenBlacklistRepository();
    systemSettingsRepository = new MongoSystemSettingsRepository();
    auditLogRepository = new MongoAuditLogRepository();
    productRepository = new MongoProductRepository();
    cartItemRepository = new MongoCartItemRepository();
    orderRepository = new MongoOrderRepository();
  } else {
    await initializePostgres();
    userRepository = new PostgresUserRepository();
    tokenBlacklistRepository = new PostgresTokenBlacklistRepository();
    systemSettingsRepository = new PostgresSystemSettingsRepository();
    auditLogRepository = new PostgresAuditLogRepository();
    productRepository = new PostgresProductRepository();
    cartItemRepository = new PostgresCartItemRepository();
    orderRepository = new PostgresOrderRepository();
  }

  initialized = true;
};

export const getAuthService = async (overrides = {}) => {
  await init();
  if (authServiceInstance && Object.keys(overrides).length === 0) {
    return authServiceInstance;
  }

  const passwordHasher = overrides.passwordHasher || new BCryptPasswordHasher();
  const tokenService = overrides.tokenService || new JWTTokenService();
  const emailService = overrides.emailService || { sendRecoveryEmail, sendWelcomeEmail };
  const smsService = overrides.smsService || { sendRecoverySMS };

  const repo = overrides.userRepository || userRepository;
  const tbk = overrides.tokenBlacklistRepository || tokenBlacklistRepository;

  const newInstance = new AuthService(
    repo, tbk, passwordHasher, tokenService, emailService, smsService,
  );

  if (Object.keys(overrides).length === 0) {
    authServiceInstance = newInstance;
  }

  return newInstance;
};

export const getUsersService = async (overrides = {}) => {
  await init();
  if (usersServiceInstance && Object.keys(overrides).length === 0) {
    return usersServiceInstance;
  }

  const repo = overrides.userRepository || userRepository;
  const newInstance = new UsersService(repo);

  if (Object.keys(overrides).length === 0) {
    usersServiceInstance = newInstance;
  }

  return newInstance;
};

export const getRecoveryService = async (overrides = {}) => {
  await init();
  if (recoveryServiceInstance && Object.keys(overrides).length === 0) {
    return recoveryServiceInstance;
  }

  const repo = overrides.userRepository || userRepository;
  const emailService = overrides.emailService || { sendRecoveryEmail };
  const smsService = overrides.smsService || { sendRecoverySMS };
  const newInstance = new RecoveryService(repo, emailService, smsService);

  if (Object.keys(overrides).length === 0) {
    recoveryServiceInstance = newInstance;
  }

  return newInstance;
};

export const getAuditService = async (overrides = {}) => {
  await init();
  if (auditServiceInstance && Object.keys(overrides).length === 0) {
    return auditServiceInstance;
  }

  const repo = overrides.auditLogRepository || auditLogRepository;
  const newInstance = new AuditService(repo);

  if (Object.keys(overrides).length === 0) {
    auditServiceInstance = newInstance;
  }

  return newInstance;
};

export const getSystemSettingsService = async (overrides = {}) => {
  await init();
  if (systemSettingsServiceInstance && Object.keys(overrides).length === 0) {
    return systemSettingsServiceInstance;
  }

  const repo = overrides.systemSettingsRepository || systemSettingsRepository;
  const newInstance = new SystemSettingsService(repo);

  if (Object.keys(overrides).length === 0) {
    systemSettingsServiceInstance = newInstance;
  }

  return newInstance;
};

export const getProductService = async (overrides = {}) => {
  await init();
  if (productServiceInstance && Object.keys(overrides).length === 0) {
    return productServiceInstance;
  }

  const repo = overrides.productRepository || productRepository;
  const newInstance = new ProductService(repo);

  if (Object.keys(overrides).length === 0) {
    productServiceInstance = newInstance;
  }

  return newInstance;
};

export const getCartService = async (overrides = {}) => {
  await init();
  if (cartServiceInstance && Object.keys(overrides).length === 0) {
    return cartServiceInstance;
  }

  const repo = overrides.cartItemRepository || cartItemRepository;
  const newInstance = new CartService(repo);

  if (Object.keys(overrides).length === 0) {
    cartServiceInstance = newInstance;
  }

  return newInstance;
};

export const getOrderService = async (overrides = {}) => {
  await init();
  if (orderServiceInstance && Object.keys(overrides).length === 0) {
    return orderServiceInstance;
  }

  const repo = overrides.orderRepository || orderRepository;
  const newInstance = new OrderService(repo);

  if (Object.keys(overrides).length === 0) {
    orderServiceInstance = newInstance;
  }

  return newInstance;
};

export const getRepositories = async () => {
  await init();
  return {
    userRepository,
    tokenBlacklistRepository,
    systemSettingsRepository,
    auditLogRepository,
    productRepository,
    cartItemRepository,
    orderRepository,
  };
};
