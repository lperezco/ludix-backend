import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  rolId: number;
}
