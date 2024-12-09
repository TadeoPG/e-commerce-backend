import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Registra la entidad User para este módulo
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Exportamos UsersService para que otros módulos puedan usarlo
})
export class UsersModule {}
