import { IsInt, IsNotEmpty, Min, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @IsInt({ message: 'userId debe ser un número entero' })
  @Min(1, { message: 'userId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userId es requerido' })
  userId: number;

  @IsInt({ message: 'creativeAreaId debe ser un número entero' })
  @Min(1, { message: 'creativeAreaId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'creativeAreaId es requerido' })
  creativeAreaId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La biografía no puede exceder 500 caracteres' })
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL del avatar no puede exceder 255 caracteres' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La ubicación no puede exceder 100 caracteres' })
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL de redes sociales no puede exceder 255 caracteres' })
  socialLinks?: string;
}