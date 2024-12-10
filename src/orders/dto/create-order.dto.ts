import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePaymentDto } from 'src/payments/dto/create-payment.dto';

export class CreateOrderDto {
  @ApiProperty({
    example: ['uuid1', 'uuid2'],
    description: 'Array of course IDs',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds: string[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment: CreatePaymentDto;
}
