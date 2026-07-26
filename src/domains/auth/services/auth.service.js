import logger from '../../../../infrastructure/logger.js';

/**
 * AuthService
 * Handles business logic for authentication.
 * Uses injected dependencies to remain infrastructure-agnostic.
 */
export class AuthService {
  constructor(
    userRepository,
    tokenBlacklistRepository,
    passwordHasher,
    tokenService,
    emailService,
    smsService
  ) {
    this.userRepository = userRepository;
    this.tokenBlacklistRepository = tokenBlacklistRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.smsService = smsService;
  }

  // --- Private Helpers ---

  _generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async _generateAndStoreTokens(user) {
    const accessToken = this.tokenService.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = this.tokenService.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ token: refreshToken });

    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    
    await this.userRepository.save(user);
    return { accessToken, refreshToken };
  }

  // --- Public Methods ---

  async registerUser({ email, password, phone, verificationMethod = 'email' }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const error = new Error('El usuario ya existe');
      error.statusCode = 409;
      throw error;
    }

    const code = this._generateOTP();
    const hashCode = await this.passwordHasher.hash(code);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await this.passwordHasher.hash(password);

    const newUser = await this.userRepository.create({
      email,
      password: hashedPassword,
      phone,
      verificationCode: hashCode,
      verificationCodeExpires: expires,
      verificationMethod,
    });

    if (verificationMethod === 'email') {
      this.emailService.sendRecoveryEmail(email, code).catch((err) =>
        logger.error('Error enviando email de verificación:', err)
      );
    } else if (verificationMethod === 'sms' && phone) {
      this.smsService.sendRecoverySMS(phone, code).catch((err) =>
        logger.error('Error enviando SMS de verificación:', err)
      );
    }

    return {
      id: newUser.id,
      email: newUser.email,
      message: `Código de verificación enviado vía ${verificationMethod}`,
    };
  }

  async loginUser({ email, password }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      logger.warn('Intento de login en cuenta bloqueada', { email });
      const error = new Error('La cuenta está bloqueada temporalmente');
      error.statusCode = 403;
      throw error;
    }

    if (!user.isVerified) {
      const error = new Error(`Cuenta no verificada. Verifica vía ${user.verificationMethod}`);
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await this.passwordHasher.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        logger.warn('Cuenta bloqueada', { email });
      }
      await this.userRepository.save(user);

      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await this.userRepository.save(user);

    if (user.is2FAEnabled) {
      const code = this._generateOTP();
      user.twoFASecret = await this.passwordHasher.hash(code);
      await this.userRepository.save(user);

      if (user.verificationMethod === 'email') {
        this.emailService.sendRecoveryEmail(user.email, code).catch((err) =>
          logger.error('Error enviando email 2FA:', err)
        );
      } else if (user.phone) {
        this.smsService.sendRecoverySMS(user.phone, code).catch((err) =>
          logger.error('Error enviando SMS 2FA:', err)
        );
      }

      const mfaToken = this.tokenService.sign(
        { id: user.id, mfaRequired: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      return { mfaRequired: true, mfaToken };
    }

    return await this._generateAndStoreTokens(user);
  }

  async verifyMFA(mfaToken, code) {
    try {
      const decoded = this.tokenService.verify(mfaToken, process.env.JWT_SECRET);
      if (!decoded.mfaRequired) throw new Error('Token inválido');

      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.twoFASecret) throw new Error('Usuario inválido o MFA no configurado');

      const isMatch = await this.passwordHasher.compare(code, user.twoFASecret);
      if (!isMatch) throw new Error('Código de verificación incorrecto');

      user.twoFASecret = null;
      await this.userRepository.save(user);

      return await this._generateAndStoreTokens(user);
    } catch (err) {
      const error = new Error('Error al verificar MFA: ' + err.message);
      error.statusCode = 401;
      throw error;
    }
  }

  async verifyAccount({ identifier, code, method }) {
    const user = method === 'email' 
      ? await this.userRepository.findByEmail(identifier)
      : await this.userRepository.findByPhone(identifier);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (user.isVerified) return { message: 'La cuenta ya está verificada' };

    if (!user.verificationCode || user.verificationCodeExpires < Date.now()) {
      const error = new Error('El código ha expirado o es inexistente');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await this.passwordHasher.compare(code, user.verificationCode);
    if (!isMatch) {
      const error = new Error('Código de verificación incorrecto');
      error.statusCode = 400;
      throw error;
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await this.userRepository.save(user);

    if (method === 'email') {
      this.emailService.sendWelcomeEmail(user.email).catch((err) =>
        logger.error('Error enviando email de bienvenida:', err)
      );
    }

    return { message: 'Cuenta verificada exitosamente' };
  }

  async resendVerificationCode({ identifier, method }) {
    const user = method === 'email' 
      ? await this.userRepository.findByEmail(identifier)
      : await this.userRepository.findByPhone(identifier);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (user.isVerified) {
      const error = new Error('La cuenta ya está verificada');
      error.statusCode = 400;
      throw error;
    }

    const code = this._generateOTP();
    user.verificationCode = await this.passwordHasher.hash(code);
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepository.save(user);

    if (method === 'email') {
      await this.emailService.sendRecoveryEmail(user.email, code);
    } else {
      await this.smsService.sendRecoverySMS(user.phone, code);
    }

    return { message: `Nuevo código enviado vía ${method}` };
  }

  async refreshAccessToken(token) {
    if (!token) {
      const error = new Error('No autorizado');
      error.statusCode = 401;
      throw error;
    }
    try {
      const decoded = this.tokenService.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await this.userRepository.findById(decoded.id);

      const tokenIndex = user?.refreshTokens.findIndex(rt => rt.token === token);

      if (!user || tokenIndex === -1) {
        const error = new Error('Token inválido o sesión cerrada');
        error.statusCode = 401;
        throw error;
      }

      const newToken = this.tokenService.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const newRefreshToken = this.tokenService.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      user.refreshTokens[tokenIndex].token = newRefreshToken;
      await this.userRepository.save(user);

      return { accessToken: newToken, refreshToken: newRefreshToken };
    } catch (err) {
      const error = new Error(err.statusCode === 401 ? err.message : 'Sesión expirada o inválida');
      error.statusCode = 401;
      throw error;
    }
  }

  async logoutUser(token) {
    if (token) {
      const user = await this.userRepository.findByRefreshToken(token); // Need to add findByRefreshToken to UserRepository interface
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
        await this.userRepository.save(user);
      }
    }
  }

  async googleAuthSuccess(user) {
    if (!user) {
      const error = new Error('Usuario no encontrado después de autenticación de Google');
      error.statusCode = 404;
      throw error;
    }
    return await this._generateAndStoreTokens(user);
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (!user.password && user.provider === 'google') {
      const error = new Error('Las cuentas registradas con Google no tienen contraseña local.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await this.passwordHasher.compare(currentPassword, user.password);
    if (!isMatch) {
      logger.warn('Intento fallido de cambio de contraseña', { userId });
      const error = new Error('La contraseña actual es incorrecta');
      error.statusCode = 401;
      throw error;
    }

    const hashedNewPassword = await this.passwordHasher.hash(newPassword);
    user.password = hashedNewPassword;
    user.refreshTokens = [];
    await this.userRepository.save(user);
    logger.info('Contraseña actualizada correctamente', { userId });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async revokeToken(token) {
    await this.tokenBlacklistRepository.add(token);
  }
}
