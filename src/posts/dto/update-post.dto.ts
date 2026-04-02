import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString, IsInt, MaxLength, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ description: 'ID del perfil que crea el post' })
  @IsOptional()
  @IsInt()
  profileId?: number;

  @ApiPropertyOptional({ description: 'ID del challenge asociado' })
  @IsOptional()
  @IsInt()
  challengeId?: number;

  @ApiPropertyOptional({ description: 'Contenido del post' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen asociada' })
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @MaxLength(500)
  imageUrl?: string;
}