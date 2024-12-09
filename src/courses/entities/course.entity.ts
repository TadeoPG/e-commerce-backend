import { Entity, Column, ManyToMany } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  instructor: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Order, (order) => order.courses)
  orders: Order[];
}
