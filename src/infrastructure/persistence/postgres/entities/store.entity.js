import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column('varchar')
  name;

  @Column('varchar')
  address;

  @Column('varchar')
  city;

  @Column('boolean', { default: true })
  isActive;

  @Column('boolean', { default: true })
  isPickupAvailable;

  @CreateDateColumn()
  createdAt;
}
