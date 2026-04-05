import { IsInt, IsString, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  exerciseId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentCommentId?: number;
}
