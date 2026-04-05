import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateExerciseTypeDto {
  @IsString()
  @MaxLength(50, { message: 'El tipo no puede exceder 50 caracteres' })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  description?: string;
}
