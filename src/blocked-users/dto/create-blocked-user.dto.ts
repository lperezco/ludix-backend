import {
  IsInt,
  IsString,
  IsDate,
  IsNotEmpty,
  Min,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockedUserDto {
  @IsInt({ message: 'userId debe ser un número entero' })
  @Min(1, { message: 'userId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userId es requerido' })
  userId: number;

  @IsInt({ message: 'blockedBy debe ser un número entero' })
  @Min(1, { message: 'blockedBy debe ser mayor a 0' })
  @IsNotEmpty({ message: 'blockedBy es requerido' })
  blockedBy: number;

  @IsString()
  @MaxLength(500, { message: 'La razón no puede exceder 500 caracteres' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  reason: string;

  @IsDate({ message: 'blockedAt debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'blockedAt es requerido' })
  blockedAt: Date;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
