import { IsOptional, IsString, IsInt, Min, MaxLength, IsUrl } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  profileId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  challengeId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @MaxLength(500)
  imageUrl?: string;
}