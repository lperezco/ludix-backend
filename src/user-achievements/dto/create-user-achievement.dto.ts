import { IsInt, IsDate, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAchievementDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  achievementId: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dateOfAchievement: Date;
}
