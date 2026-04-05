import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUser } from './entities/blocked-user.entity';
import { BlockedUsersService } from './blocked-users.service';
import { BlockedUsersController } from './blocked-users.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedUser, User])],
  controllers: [BlockedUsersController],
  providers: [BlockedUsersService],
  exports: [BlockedUsersService],
})
export class BlockedUsersModule {}
