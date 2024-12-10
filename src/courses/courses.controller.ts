import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FilterCoursesDto } from './dto/filter-courses.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiOperation({ summary: 'Create new course (Admin only)' })
  // @ApiResponse({ status: 201, description: 'Course created successfully' })
  // async create(@Body() createCourseDto: CreateCourseDto) {
  //   return this.coursesService.create(createCourseDto);
  // }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        price: {
          type: 'number',
        },
        instructor: {
          type: 'string',
        },
      },
    },
  })
  async create(
    @UploadedFile() file: any,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.coursesService.create(file, createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns all courses' })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filterDto: FilterCoursesDto,
  ) {
    const { page, limit, ...filters } = filterDto;
    return this.coursesService.findAll(filters, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiResponse({ status: 200, description: 'Returns a course' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update course (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete course (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
