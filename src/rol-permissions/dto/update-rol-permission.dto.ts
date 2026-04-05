import { PartialType } from '@nestjs/mapped-types';
import { CreateRolPermissionDto } from './create-rol-permission.dto';

export class UpdateRolPermissionDto extends PartialType(
  CreateRolPermissionDto,
) {}
