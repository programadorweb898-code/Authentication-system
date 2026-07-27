import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column('uuid')
  userId;

  @Column('varchar')
  street;

  @Column('varchar')
  city;

  @Column('varchar')
  state;

  @Column('varchar')
  postalCode;

  @Column('varchar')
  country;

  @Column('boolean', { default: false })
  isDefault;

  @CreateDateColumn()
  createdAt;
}
