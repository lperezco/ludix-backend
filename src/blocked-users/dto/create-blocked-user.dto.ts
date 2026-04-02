import { IsInt, IsString, IsDate, IsNotEmpty, Min, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';



export class CreateBlockedUserDto {
  // @ApiProperty({ example: 1, description: 'ID del usuario bloqueado' })  // ❌ ELIMINA o comenta
  @IsInt({ message: 'userId debe ser un número entero' })
  @Min(1, { message: 'userId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userId es requerido' })
  userId: number;

  // @ApiProperty({ example: 1, description: 'ID del usuario que bloquea' }) // ❌ ELIMINA o comenta
  @IsInt({ message: 'blockedBy debe ser un número entero' })
  @Min(1, { message: 'blockedBy debe ser mayor a 0' })
  @IsNotEmpty({ message: 'blockedBy es requerido' })
  blockedBy: number;

  // @ApiProperty({ example: 'Spam y contenido inapropiado', description: 'Razón del bloqueo' }) // ❌ ELIMINA
  @IsString()
  @MaxLength(500, { message: 'La razón no puede exceder 500 caracteres' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  reason: string;

  // @ApiProperty({ example: '2024-03-27', description: 'Fecha del bloqueo' }) // ❌ ELIMINA
  @IsDate({ message: 'blockedAt debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'blockedAt es requerido' })
  blockedAt: Date;

  // @ApiProperty({ example: true, description: 'Estado del bloqueo', required: false }) // ❌ ELIMINA
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}