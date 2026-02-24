import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAchievement } from './entities/user-achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAchievement])],
  controllers: [],
  providers: [],
})
export class UserAchievementsModule {}