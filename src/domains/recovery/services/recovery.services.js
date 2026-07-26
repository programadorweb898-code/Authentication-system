import bcrypt from 'bcryptjs';

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
      const error = new Error('Método de recuperación inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!user) {
      await bcrypt.hash('fake-code', 10);
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
        console.error('Error enviando email:', err),
      );
    }

    if (method === 'sms') {
      this.smsService.sendRecoverySMS(user.phone, code).catch((err) =>
        console.error('Error enviando SMS:', err),
      );
    }

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
      const error = new Error('Código inválido');
      error.statusCode = 400;
      throw error;
    }

    if (!user.recoveryCode || !user.recoveryCodeExpires) {
      const error = new Error('No hay una solicitud de recuperación activa');
      error.statusCode = 400;
      throw error;
    }

    if (user.recoveryCodeExpires < Date.now()) {
      const error = new Error('El código ha expirado');
      error.statusCode = 400;
      throw error;
    }

    if (user.recoveryAttempts >= 3) {
      const error = new Error('Demasiados intentos. Solicite un nuevo código');
      error.statusCode = 429;
      throw error;
    }

    const isMatch = await bcrypt.compare(code, user.recoveryCode);
    if (!isMatch) {
      user.recoveryAttempts += 1;
      await this.userRepository.save(user);
      const error = new Error('Código inválido');
      error.statusCode = 400;
      throw error;
    }

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
      const error = new Error('Usuario no encontrado');
      error.statusCode = 400;
      throw error;
    }

    if (!user.recoveryCode || !user.recoveryCodeExpires) {
      const error = new Error('No hay una solicitud de recuperación activa');
      error.statusCode = 400;
      throw error;
    }

    if (user.recoveryCodeExpires < Date.now()) {
      const error = new Error('El código ha expirado');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(code, user.recoveryCode);
    if (!isMatch) {
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

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}
