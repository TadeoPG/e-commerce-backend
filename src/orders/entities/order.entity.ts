import {
  Entity,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Column,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum OrderStatus {
  PENDING = 'pending', // La orden está creada pero el pago está pendiente
  PROCESSING = 'processing', // El pago está siendo procesado
  COMPLETED = 'completed', // El pago fue exitoso y la orden está completa
  FAILED = 'failed', // El pago falló o la orden fue cancelada
}

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToMany(() => Course, (course) => course.orders)
  @JoinTable({
    name: 'order_courses', // Nombre de la tabla intermedia
    joinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'course_id',
      referencedColumnName: 'id',
    },
  })
  courses: Course[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;
}
