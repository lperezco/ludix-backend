import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateExerciseTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}