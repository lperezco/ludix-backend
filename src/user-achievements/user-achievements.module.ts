import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserAchievementsService } from './user-achievements.service';
import { UserAchievementsController } from './user-achievements.controller';
import { User } from '../users/entities/user.entity';
import { Achievement } from '../achievements/entities/achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAchievement, User, Achievement])],
  controllers: [UserAchievementsController],
  providers: [UserAchievementsService],
  exports: [UserAchievementsService],
})
export class UserAchievementsModule {}