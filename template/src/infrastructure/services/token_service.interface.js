/**
 * Token Service Interface
 */
class TokenService {
  sign(payload, secret, options) {
    throw new Error('Method sign must be implemented');
  }

  verify(token, secret) {
    throw new Error('Method verify must be implemented');
  }

  decode(token) {
    throw new Error('Method decode must be implemented');
  }
}

export default TokenService;
