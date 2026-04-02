import { IsInt, IsString, IsNotEmpty, Min, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateReportDto {
  @IsInt({ message: 'postId debe ser un número entero' })
  @Min(1, { message: 'postId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'postId es requerido' })
  postId: number;

  @IsInt({ message: 'reportedBy debe ser un número entero' })
  @Min(1, { message: 'reportedBy debe ser mayor a 0' })
  @IsNotEmpty({ message: 'reportedBy es requerido' })
  reportedBy: number;

  @IsString()
  @MaxLength(500, { message: 'La razón no puede exceder 500 caracteres' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  reason: string;

  @IsOptional()
  @IsIn(['pending', 'reviewing', 'approved', 'rejected'], { 
    message: 'status debe ser: pending, reviewing, approved o rejected' 
  })
  status?: string;
}