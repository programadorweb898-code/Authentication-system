import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  adminId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetUserId: string;

  @Column('jsonb', { nullable: true })
  details: object;

  @CreateDateColumn()
  timestamp: Date;
}
