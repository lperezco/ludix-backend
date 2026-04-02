import { IsOptional, IsInt, IsString, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';



export class UpdateBlockedUserDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  blockedBy?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  blockedAt?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}