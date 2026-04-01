import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserType } from '../user-types/entities/user-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserType])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
