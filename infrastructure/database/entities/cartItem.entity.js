import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id;

  @Column('uuid')
  userId;

  @Column('int')
  productId;

  @Column('int', { default: 1 })
  quantity;
}
