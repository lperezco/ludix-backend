import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCreativeAreaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
