import { IsInt, IsString, IsNotEmpty, Min, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 1, description: 'ID del post que se reporta' })
  @IsInt({ message: 'postId debe ser un número entero' })
  @Min(1, { message: 'postId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'postId es requerido' })
  postId: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que reporta' })
  @IsInt({ message: 'reportedBy debe ser un número entero' })
  @Min(1, { message: 'reportedBy debe ser mayor a 0' })
  @IsNotEmpty({ message: 'reportedBy es requerido' })
  reportedBy: number;

  @ApiProperty({ 
    example: 'Contenido inapropiado', 
    description: 'Razón del reporte',
    maxLength: 500 
  })
  @IsString()
  @MaxLength(500, { message: 'La razón no puede exceder 500 caracteres' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  reason: string;

  @ApiProperty({ 
    example: 'pendiente', 
    description: 'Estado del reporte',
    enum: ['pendiente', 'revisando', 'aprobado', 'rechazado'],
    required: false 
  })
  @IsOptional()
  @IsIn(['pendiente', 'revisando', 'aprobado', 'rechazado'], { 
    message: 'status debe ser: pendiente, revisando, aprobado o rechazado' 
  })
  status?: string;
}