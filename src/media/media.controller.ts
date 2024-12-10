import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['image', 'video'],
        },
        courseId: {
          type: 'string',
        },
      },
    },
  })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
  ) {
    return this.mediaService.uploadMedia(file, createMediaDto);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.mediaService.findByCourse(courseId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.remove(id);
  }
}
