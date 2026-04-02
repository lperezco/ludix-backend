import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTypeDto } from './create-user-type.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserTypeDto extends PartialType(CreateUserTypeDto) {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;
}