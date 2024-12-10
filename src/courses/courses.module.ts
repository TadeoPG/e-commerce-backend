import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), forwardRef(() => MediaModule)],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService], // Exportamos para que OrdersModule pueda usarlo
})
export class CoursesModule {}
