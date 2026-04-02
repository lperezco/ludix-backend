import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiPropertyOptional({ description: 'Estado del reporte' })
  @IsOptional()
  @IsIn(['pendiente', 'revisando', 'aprobado', 'rechazado'], { 
    message: 'status debe ser: pendiente, revisando, aprobado o rechazado' 
  })
  status?: string;

  @ApiPropertyOptional({ description: 'Comentarios del moderador' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Los comentarios no pueden exceder 1000 caracteres' })
  moderatorComment?: string;

  @ApiPropertyOptional({ description: 'ID del moderador que revisa' })
  @IsOptional()
  @IsInt()
  @Min(1)
  reviewedBy?: number;
}