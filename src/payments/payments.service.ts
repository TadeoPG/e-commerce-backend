import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(
    order: Order,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    const payment = this.paymentRepository.create({
      method: createPaymentDto.method,
      amount: order.total,
      order,
    });

    switch (createPaymentDto.method) {
      case PaymentMethod.CARD:
        if (
          !createPaymentDto.cardLastFourDigits ||
          !createPaymentDto.cardHolderName
        ) {
          throw new BadRequestException('Card details are required');
        }
        payment.cardLastFourDigits = createPaymentDto.cardLastFourDigits;
        payment.cardHolderName = createPaymentDto.cardHolderName;
        break;

      case PaymentMethod.YAPE:
        if (
          !createPaymentDto.yapePhoneNumber ||
          !createPaymentDto.yapeOwnerName
        ) {
          throw new BadRequestException('Yape details are required');
        }
        payment.yapePhoneNumber = createPaymentDto.yapePhoneNumber;
        payment.yapeOwnerName = createPaymentDto.yapeOwnerName;
        break;

      case PaymentMethod.PAYPAL:
        if (!createPaymentDto.paypalEmail) {
          throw new BadRequestException('PayPal email is required');
        }
        payment.paypalEmail = createPaymentDto.paypalEmail;
        break;
    }

    // Por defecto, el pago queda en pending
    payment.status = PaymentStatus.PENDING;

    return await this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    return await this.paymentRepository.save(payment);
  }
}
