import { IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../entities/media.entity';

export class CreateMediaDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty()
  @IsUUID()
  courseId: string;
}
