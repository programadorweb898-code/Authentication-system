import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './orderItem.entity.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column('uuid')
  userId;

  @Column('varchar', { default: 'pending' })
  status;

  @Column('decimal')
  total;

  @Column('varchar', { default: 'shipping' })
  deliveryMethod;

  @Column('uuid', { nullable: true })
  storeId;

  @Column('uuid', { nullable: true })
  shippingAddressId;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items;

  @CreateDateColumn()
  createdAt;
}
