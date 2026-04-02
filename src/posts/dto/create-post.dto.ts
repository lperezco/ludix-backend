import { IsInt, IsString, IsNotEmpty, Min, MaxLength, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 1, description: 'ID del perfil que crea el post' })
  @IsInt({ message: 'profileId debe ser un número entero' })
  @Min(1, { message: 'profileId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'profileId es requerido' })
  profileId: number;

  @ApiProperty({ example: 1, description: 'ID del challenge asociado' })
  @IsInt({ message: 'challengeId debe ser un número entero' })
  @Min(1, { message: 'challengeId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'challengeId es requerido' })
  challengeId: number;

  @ApiProperty({ 
    example: 'Hoy completé el reto de correr 5km! 🏃‍♂️', 
    description: 'Contenido del post',
    maxLength: 2000 
  })
  @IsString()
  @MaxLength(2000, { message: 'El contenido no puede exceder 2000 caracteres' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @ApiProperty({ 
    example: 'https://example.com/image.jpg', 
    description: 'URL de la imagen asociada',
    required: false 
  })
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @MaxLength(500, { message: 'La URL no puede exceder 500 caracteres' })
  imageUrl?: string;
}