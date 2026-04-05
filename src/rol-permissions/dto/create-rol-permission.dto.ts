import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRolPermissionDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  rolId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  permissionId: number;
}
