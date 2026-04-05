import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateCreativeAreaDto {
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  area: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;
}
