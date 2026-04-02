import { IsString, IsInt, IsDate, IsNotEmpty, Min, MaxLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChallengeDto {
  @IsString()
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @IsInt({ message: 'exerciseTypeId debe ser un número entero' })
  @Min(1, { message: 'exerciseTypeId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'exerciseTypeId es requerido' })
  exerciseTypeId: number;

  @IsDate({ message: 'startDate debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'startDate es requerido' })
  startDate: Date;

  @IsDate({ message: 'endDate debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'endDate es requerido' })
  endDate: Date;

  @IsInt({ message: 'createdBy debe ser un número entero' })
  @Min(1, { message: 'createdBy debe ser mayor a 0' })
  @IsNotEmpty({ message: 'createdBy es requerido' })
  createdBy: number;
}