import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAchievementDto } from './create-user-achievement.dto';
import { IsOptional, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserAchievementDto extends PartialType(CreateUserAchievementDto) {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  achievementId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfAchievement?: Date;
}