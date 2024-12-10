import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Media } from 'src/media/entities/media.entity';

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

  @Column({ nullable: true })
  thumbnailUrl: string;

  @ManyToMany(() => Order, (order) => order.courses)
  orders: Order[];

  @OneToMany(() => Media, (media) => media.course)
  media: Media[];
}
