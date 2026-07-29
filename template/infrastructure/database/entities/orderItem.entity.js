import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id;

  @Column('int')
  productId;

  @Column('int')
  quantity;

  @Column('decimal')
  priceAtPurchase;

  @ManyToOne(() => Order, (order) => order.items)
  order;
}
