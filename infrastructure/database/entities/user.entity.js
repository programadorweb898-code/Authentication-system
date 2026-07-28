import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RefreshToken } from './refresh_token.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({ default: 'local' })
  provider: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, { cascade: true })
  refreshTokens: RefreshToken[];

  @Column({ nullable: true })
  recoveryCode?: string;

  @Column({ nullable: true })
  recoveryCodeExpires?: Date;

  @Column({ default: 0 })
  recoveryAttempts: number;

  @Column({ nullable: true })
  recoveryMethod?: string;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ nullable: true })
  lockUntil?: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationCode?: string;

  @Column({ nullable: true })
  verificationCodeExpires?: Date;

  @Column({ default: 'email' })
  verificationMethod: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: false })
  is2FAEnabled: boolean;

  @Column({ nullable: true })
  twoFASecret?: string;

  @Column({ default: 'app' })
  twoFAType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
