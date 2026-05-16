import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email requerido'],
      trim: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'formato invalido'],
    },
    password: {
      type: String,
      trim: true,
      match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, 'Password inválido'],
      required: [true, 'password requerido'],
    },
    refreshToken: {
      type: String,
    },
    recoveryCode: {
      type: String,
      default: null,
    },
    recoveryCodeExpires: {
      type: Date,
      default: null,
    },
    recoveryAttempts: {
      type: Number,
      default: 0,
    },
    recoveryMethod: {
      type: String,
      enum: ['email', 'sms'],
      default: null,
    },
    loginAttempts:{
      type:Number,
      default:0
    },
    lockUntil:{
      type:Date,
      default:null
    }
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const hashPassword = await bcrypt.hash(this.password, 10);
  this.password = hashPassword;
});
const User = mongoose.model('user', userSchema);
export default User;
