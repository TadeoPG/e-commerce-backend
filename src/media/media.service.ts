import {
  Injectable,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Media, MediaType } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { CoursesService } from '../courses/courses.service';
import { CloudinaryResponse } from './interfaces/cloudinary-response.interface';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadMedia(
    file: Express.Multer.File,
    createMediaDto: CreateMediaDto,
  ): Promise<Media> {
    const course = await this.coursesService.findOne(createMediaDto.courseId);

    try {
      const uploadResponse = await this.uploadToCloudinary(
        file,
        createMediaDto.type,
      );

      const media = this.mediaRepository.create({
        title: createMediaDto.title,
        type: createMediaDto.type,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        course,
      });

      return await this.mediaRepository.save(media);
    } catch (error) {
      throw new BadRequestException('Failed to upload file to Cloudinary');
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    type: MediaType,
  ): Promise<CloudinaryResponse> {
    const resourceType = type === MediaType.VIDEO ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `courses/${type}s`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async findByCourse(courseId: string): Promise<Media[]> {
    const media = await this.mediaRepository.find({
      where: { course: { id: courseId } },
      relations: ['course'],
    });

    if (!media.length) {
      throw new NotFoundException(`No media found for course ${courseId}`);
    }

    return media;
  }

  async remove(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    try {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === MediaType.VIDEO ? 'video' : 'image',
      });
      await this.mediaRepository.remove(media);
    } catch (error) {
      throw new BadRequestException('Failed to delete media');
    }
  }
}
