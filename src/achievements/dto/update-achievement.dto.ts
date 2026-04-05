import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateAchievementDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  requirement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}
