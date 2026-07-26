/**
 * Password Hasher Interface
 */
class PasswordHasher {
  async hash(password) {
    throw new Error('Method hash must be implemented');
  }

  async compare(password, hash) {
    throw new Error('Method compare must be implemented');
  }
}

export default PasswordHasher;
