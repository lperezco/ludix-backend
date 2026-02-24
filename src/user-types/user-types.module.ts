import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserType } from './entities/user-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserType])],
  controllers: [],
  providers: [],
})
export class UserTypesModule {}