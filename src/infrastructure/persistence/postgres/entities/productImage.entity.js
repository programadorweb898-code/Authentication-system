import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity.js';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column('int')
  productId;

  @Column('varchar')
  url;

  @Column('boolean', { default: false })
  isMain;

  @CreateDateColumn()
  createdAt;

  @ManyToOne(() => Product)
  product;
}
