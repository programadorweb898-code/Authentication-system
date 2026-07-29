import bcrypt from 'bcryptjs';
import logger from '../../../infrastructure/logger.js';

export class RecoveryService {
  constructor(userRepository, emailService, smsService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.smsService = smsService;
  }

  async recoveryRequest({ method, email, phone }) {
    let user;
    if (method === 'email') {
      user = await this.userRepository.findByEmail(email);
    } else if (method === 'sms') {
      user = await this.userRepository.findByPhone(phone);
    } else {
      logger.warn('Intento de recuperación con método inválido', { method });
      const error = new Error('Método de recuperación inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!user) {
      await bcrypt.hash('fake-code', 10);
      logger.info('Solicitud de recuperación para usuario inexistente', { method, email, phone });
      return {
        message: 'Si el usuario existe, se enviará un código de recuperación',
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashCode = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.recoveryCode = hashCode;
    user.recoveryCodeExpires = expires;
    user.recoveryAttempts = 0;
    user.recoveryMethod = method;

    await this.userRepository.save(user);

    if (method === 'email') {
      this.emailService.sendRecoveryEmail(user.email, code).catch((err) =>
        logger.error('Error enviando email de recuperación:', err),
      );
    }

    if (method === 'sms') {
      this.smsService.sendRecoverySMS(user.phone, code).catch((err) =>
        logger.error('Error enviando SMS de recuperación:', err),
      );
    }

    logger.info('Solicitud de recuperación generada', { userId: user.id, method });
    return {
      message: 'Código de recuperación enviado correctamente',
    };
  }

  async verifyRecoveryCode({ method, email, phone, code }) {
    let user;
    if (method === 'email') {
      user = await this.userRepository.findByEmail(email);
    } else if (method === 'sms') {
      user = await this.userRepository.findByPhone(phone);
    }

    if (!user) {
      logger.warn('Intento de verificación de código para usuario inexistente', { method, email, phone });
      const error = new Error('Código inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!user.recoveryCode || !user.recoveryCodeExpires) {
      logger.warn('Intento de verificación de código sin solicitud activa', { userId: user.id });
      const error = new Error('No hay una solicitud de recuperación activa');
      error.statusCode = 400;
      throw error;
    }

    if (user.recoveryCodeExpires < Date.now()) {
      logger.warn('Intento de verificación de código expirado', { userId: user.id });
      const error = new Error('El código ha expirado');
      error.statusCode = 400;
      throw error;
    }

    if (user.recoveryAttempts >= 3) {
      logger.warn('Intento de verificación superó límites', { userId: user.id });
      const error = new Error('Demasiados intentos. Solicite un nuevo código');
      error.statusCode = 429;
      throw error;
    }

    const isMatch = await bcrypt.compare(code, user.recoveryCode);
    if (!isMatch) {
      user.recoveryAttempts += 1;
      await this.userRepository.save(user);
      logger.warn('Intento fallido de verificación de código', { userId: user.id, attempts: user.recoveryAttempts });
      const error = new Error('Código inválido');
      error.statusCode = 400;
      throw error;
    }

    logger.info('Código de recuperación verificado', { userId: user.id });
    return {
      message: 'Código verificado correctamente',
    };
  }

  async resetPassword({ method, phone, email, code, newPassword }) {
    let user;
    if (method === 'email') {
      user = await this.userRepository.findByEmail(email);
    } else if (method === 'sms') {
      user = await this.userRepository.findByPhone(phone);
    }

    if (!user) {
      logger.warn('Intento de reset de password para usuario inexistente', { method, email, phone });
      const error = new Error('Usuario no encontrado');
      error.statusCode = 400;
      throw error;
    }

    if (!user.recoveryCode || !user.recoveryCodeExpires) {
      logger.warn('Intento de reset de password sin solicitud activa', { userId: user.id });
      const error = new Error('No hay una solicitud de recuperación activa');
      error.statusCode = 400;
      throw error;
    }

    if (user.recoveryCodeExpires < Date.now()) {
      logger.warn('Intento de reset de password con código expirado', { userId: user.id });
      const error = new Error('El código ha expirado');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(code, user.recoveryCode);
    if (!isMatch) {
      logger.warn('Intento fallido de reset de password por código incorrecto', { userId: user.id });
      const error = new Error('Código inválido');
      error.statusCode = 400;
      throw error;
    }

    const bcryptHash = await bcrypt.hash(newPassword, 10);
    user.password = bcryptHash;
    user.recoveryCode = null;
    user.recoveryCodeExpires = null;
    user.recoveryMethod = null;
    user.recoveryAttempts = 0;
    user.refreshTokens = [];
    await this.userRepository.save(user);

    logger.info('Contraseña reseteada exitosamente', { userId: user.id });
    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}
