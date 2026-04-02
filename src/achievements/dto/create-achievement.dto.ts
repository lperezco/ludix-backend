import { IsString, IsOptional, MaxLength, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @IsString()
  @MaxLength(255, { message: 'El requisito no puede exceder 255 caracteres' })
  @IsNotEmpty({ message: 'El requisito es requerido' })
  requirement: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'El icono no puede exceder 10 caracteres' })
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  points?: number;
}