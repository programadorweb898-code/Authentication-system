import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  name;

  @Column('decimal')
  price;

  @Column()
  category;

  @Column('text')
  description;
}
