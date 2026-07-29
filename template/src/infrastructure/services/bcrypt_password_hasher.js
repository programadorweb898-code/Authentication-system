import bcrypt from 'bcryptjs';
import PasswordHasher from './password_hasher.interface.js';

export class BCryptPasswordHasher extends PasswordHasher {
  constructor(rounds = 10) {
    super();
    this.rounds = rounds;
  }

  async hash(password) {
    return await bcrypt.hash(password, this.rounds);
  }

  async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

export default BCryptPasswordHasher;
