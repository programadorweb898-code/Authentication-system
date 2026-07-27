import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id;

  @Column('varchar')
  name;

  @Column('decimal')
  price;

  @Column('varchar')
  category;

  @Column('text')
  description;
}
