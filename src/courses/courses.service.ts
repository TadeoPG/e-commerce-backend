import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Course } from './entities/course.entity';
import { FilterCoursesDto } from './dto/filter-courses.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { MediaService } from 'src/media/media.service';
import { MediaType } from 'src/media/entities/media.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(forwardRef(() => MediaService))
    private readonly mediaService: MediaService,
  ) {}

  async create(file: any, createCourseDto: CreateCourseDto): Promise<Course> {
    // Primero creamos el curso
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);

    // Luego subimos la miniatura como media
    if (file) {
      const thumbnailDto = {
        title: `${course.title} thumbnail`,
        type: MediaType.IMAGE,
        courseId: savedCourse.id,
      };

      const thumbnail = await this.mediaService.uploadMedia(file, thumbnailDto);

      // Actualizamos el curso con la URL de la miniatura
      savedCourse.thumbnailUrl = thumbnail.url;
      await this.courseRepository.save(savedCourse);
    }

    return savedCourse;
  }

  async findAll(
    filterDto: FilterCoursesDto,
    paginationDto: PaginationDto,
  ): Promise<{ items: Course[]; meta: any }> {
    const { search, minPrice, maxPrice, instructor } = filterDto;
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.courseRepository.createQueryBuilder('course');
    queryBuilder.where('course.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(course.title LIKE :search OR course.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('course.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('course.price <= :maxPrice', { maxPrice });
    }

    if (instructor) {
      queryBuilder.andWhere('course.instructor LIKE :instructor', {
        instructor: `%${instructor}%`,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id, isActive: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    await this.courseRepository.update(id, updateCourseDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    // Soft delete
    await this.courseRepository.update(id, { isActive: false });
  }
}
