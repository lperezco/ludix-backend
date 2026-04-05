import { IsInt, IsDate, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExerciseHistoryDto {
  @IsInt({ message: 'userId debe ser un número entero' })
  @Min(1, { message: 'userId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userId es requerido' })
  userId: number;

  @IsInt({ message: 'exerciseId debe ser un número entero' })
  @Min(1, { message: 'exerciseId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'exerciseId es requerido' })
  exerciseId: number;

  @IsDate({ message: 'completedAt debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'completedAt es requerido' })
  completedAt: Date;
}
