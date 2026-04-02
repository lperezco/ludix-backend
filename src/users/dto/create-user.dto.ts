import { IsEmail, IsString, MinLength, MaxLength, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsInt({ message: 'userTypeId debe ser un número entero' })
  @Min(1, { message: 'userTypeId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'userTypeId es requerido' })
  userTypeId: number;
}