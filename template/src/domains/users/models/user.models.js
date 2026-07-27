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
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values, so users without googleId can exist
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    phone: {
      type: String,
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        userAgent: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
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
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
    verificationMethod: {
      type: String,
      enum: ['email', 'sms'],
      default: 'email',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFASecret: {
      type: String,
      default: null,
    },
    twoFAType: {
      type: String,
      enum: ['app', 'sms'],
      default: 'app',
    },
  },
  { timestamps: true },
);

const User = mongoose.model('user', userSchema);
export default User;
