import { IsOptional, IsInt, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExerciseHistoryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  exerciseId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;
}
