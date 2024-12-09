import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: ['uuid1', 'uuid2'],
    description: 'Array of course IDs',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds: string[];
}
