import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  maintenanceMode: boolean;

  @Column({ default: 5 })
  loginRateLimit: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
