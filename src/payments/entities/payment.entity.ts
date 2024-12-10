import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentMethod {
  CARD = 'card',
  YAPE = 'yape',
  PAYPAL = 'paypal',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  // Para pagos con tarjeta
  @Column({ nullable: true })
  cardLastFourDigits: string;

  @Column({ nullable: true })
  cardHolderName: string;

  // Para Yape
  @Column({ nullable: true })
  yapePhoneNumber: string;

  @Column({ nullable: true })
  yapeOwnerName: string;

  // Para PayPal
  @Column({ nullable: true })
  paypalEmail: string;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;
}
