import { IsInt, IsString, IsNotEmpty, Min, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsInt({ message: 'profileId debe ser un número entero' })
  @Min(1, { message: 'profileId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'profileId es requerido' })
  profileId: number;

  @IsInt({ message: 'challengeId debe ser un número entero' })
  @Min(1, { message: 'challengeId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'challengeId es requerido' })
  challengeId: number;

  @IsString()
  @MaxLength(2000, { message: 'El contenido no puede exceder 2000 caracteres' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @MaxLength(500, { message: 'La URL no puede exceder 500 caracteres' })
  imageUrl?: string;
}