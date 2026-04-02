import { IsInt, IsNotEmpty, Min, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 1, description: 'ID del usuario asociado' })
  @IsInt({ message: 'userId debe ser un número entero' })
  @Min(1, { message: 'userId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userId es requerido' })
  userId: number;

  @ApiProperty({ example: 1, description: 'ID del área creativa' })
  @IsInt({ message: 'creativeAreaId debe ser un número entero' })
  @Min(1, { message: 'creativeAreaId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'creativeAreaId es requerido' })
  creativeAreaId: number;

  @ApiProperty({ 
    example: 'Me encanta la música y el arte', 
    description: 'Biografía del usuario',
    required: false,
    maxLength: 500 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  bio?: string;

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg', 
    description: 'URL del avatar',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL del avatar no puede exceder 255 caracteres' })
  avatarUrl?: string;

  @ApiProperty({ 
    example: 'Ciudad de México', 
    description: 'Ubicación del usuario',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La ubicación no puede exceder 100 caracteres' })
  location?: string;

  @ApiProperty({ 
    example: 'https://twitter.com/usuario', 
    description: 'URL de redes sociales',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL de redes sociales no puede exceder 255 caracteres' })
  socialLinks?: string;
}