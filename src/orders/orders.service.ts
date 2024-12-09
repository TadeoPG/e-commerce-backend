import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from './entities/order.entity';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CoursesService } from '../courses/courses.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.usersService.findOne(userId);
    const courses = await Promise.all(
      createOrderDto.courseIds.map((id) => this.coursesService.findOne(id)),
    );

    if (courses.length === 0) {
      throw new BadRequestException('No valid courses provided');
    }

    const total = courses.reduce(
      (sum, course) => sum + Number(course.price),
      0,
    );

    const order = this.orderRepository.create({
      user,
      courses,
      total,
    });

    return await this.orderRepository.save(order);
  }

  async findUserOrders(
    userId: string,
    filterDto: Omit<FilterOrdersDto, 'page' | 'limit'>,
    paginationDto: { page: number; limit: number },
  ): Promise<{ items: Order[]; meta: any }> {
    const { startDate, endDate } = filterDto;
    const { page, limit } = paginationDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.courses', 'courses')
      .where('order.user.id = :userId', { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('order.createdAt', 'DESC');

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

  async findAll(
    filterDto: Omit<FilterOrdersDto, 'page' | 'limit'>,
    paginationDto: { page: number; limit: number },
  ): Promise<{ items: Order[]; meta: any }> {
    const { startDate, endDate } = filterDto;
    const { page, limit } = paginationDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.courses', 'courses');

    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('order.createdAt', 'DESC');

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
}