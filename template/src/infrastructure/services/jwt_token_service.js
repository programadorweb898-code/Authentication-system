import jwt from 'jsonwebtoken';
import TokenService from './token_service.interface.js';

export class JWTTokenService extends TokenService {
  sign(payload, secret, options) {
    return jwt.sign(payload, secret, options);
  }

  verify(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  decode(token) {
    return jwt.decode(token);
  }
}

export default JWTTokenService;
