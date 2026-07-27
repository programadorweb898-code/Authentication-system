import { AuthService } from '../src/domains/auth/services/auth.service.js';

describe('AuthService Unit Tests', () => {
  let authService;
  let mockUserRepository;
  let mockTokenBlacklistRepository;
  let mockPasswordHasher;
  let mockTokenService;
  let mockEmailService;
  let mockSmsService;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };
    mockTokenBlacklistRepository = { add: jest.fn() };
    mockPasswordHasher = { hash: jest.fn(), compare: jest.fn() };
    mockTokenService = { sign: jest.fn(), verify: jest.fn() };
    mockEmailService = { sendRecoveryEmail: jest.fn(), sendWelcomeEmail: jest.fn() };
    mockSmsService = { sendRecoverySMS: jest.fn() };

    authService = new AuthService(
      mockUserRepository,
      mockTokenBlacklistRepository,
      mockPasswordHasher,
      mockTokenService,
      mockEmailService,
      mockSmsService
    );
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = { email: 'test@example.com', password: 'password', verificationMethod: 'email' };
      const hashedCode = 'hashed_code';
      
      mockPasswordHasher.hash.mockResolvedValue(hashedCode);
      mockUserRepository.create.mockResolvedValue({ id: 'user_123', email: userData.email });
      mockEmailService.sendRecoveryEmail.mockResolvedValue();

      const result = await authService.registerUser(userData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        verificationCode: hashedCode
      }));
      expect(result.id).toBe('user_123');
      expect(mockEmailService.sendRecoveryEmail).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should fail if user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.loginUser({ email: 'no@test.com', password: 'pw' }))
        .rejects.toThrow('Credenciales inválidas');
    });

    it('should login successfully if credentials are correct', async () => {
      const user = {
        id: 'user_1',
        email: 'test@test.com',
        password: 'hashed_password',
        isVerified: true,
        refreshTokens: []
      };
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenService.sign.mockReturnValue('token');
      mockUserRepository.save.mockResolvedValue(user);

      const result = await authService.loginUser({ email: 'test@test.com', password: 'password' });

      expect(result).toHaveProperty('accessToken');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
