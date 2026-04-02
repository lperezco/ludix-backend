import { IsString, IsInt, IsNotEmpty, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @IsInt({ message: 'duration debe ser un número entero' })
  @Min(1, { message: 'duration debe ser al menos 1 minuto' })
  @IsNotEmpty({ message: 'La duración es requerida' })
  duration: number;

  @IsInt({ message: 'exerciseTypeId debe ser un número entero' })
  @Min(1, { message: 'exerciseTypeId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'exerciseTypeId es requerido' })
  exerciseTypeId: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}