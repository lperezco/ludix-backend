import { IsString, IsOptional, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTypeDto {
  @ApiProperty({ example: 'admin', description: 'Tipo de usuario (admin, user, etc)' })
  @IsString()
  @MinLength(2, { message: 'El tipo debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El tipo no puede exceder 50 caracteres' })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  type: string;

  @ApiProperty({ example: 'Usuario administrador con todos los permisos', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  description?: string;
}