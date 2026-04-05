import { IsOptional, IsInt, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserAchievementDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  achievementId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfAchievement?: Date;
}
