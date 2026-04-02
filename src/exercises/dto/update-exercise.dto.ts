import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  exerciseTypeId?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}