import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUser } from './entities/blocked-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedUser])],
  controllers: [],
  providers: [],
})
export class BlockedUsersModule {}