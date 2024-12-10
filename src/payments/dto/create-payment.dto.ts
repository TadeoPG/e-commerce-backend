import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod })
  method: PaymentMethod;

  // Para tarjeta
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  cardLastFourDigits?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  cardHolderName?: string;

  // Para Yape
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  yapePhoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  yapeOwnerName?: string;

  // Para PayPal
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  paypalEmail?: string;
}
