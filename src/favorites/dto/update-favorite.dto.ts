import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateFavoriteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  exerciseId?: number;
}