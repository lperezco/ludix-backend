import { IsOptional, IsString, IsInt, IsDate, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  exerciseTypeId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  createdBy?: number;
}