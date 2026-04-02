import { IsInt, IsDate, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAchievementDto {
  @IsInt({ message: 'userId debe ser un número entero' })
  @Min(1, { message: 'userId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userId es requerido' })
  userId: number;

  @IsInt({ message: 'achievementId debe ser un número entero' })
  @Min(1, { message: 'achievementId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'achievementId es requerido' })
  achievementId: number;

  @IsDate({ message: 'dateOfAchievement debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'dateOfAchievement es requerido' })
  dateOfAchievement: Date;
}