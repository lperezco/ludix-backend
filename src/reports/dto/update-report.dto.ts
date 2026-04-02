import { IsOptional, IsString, IsInt, Min, MaxLength, IsIn } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  postId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reportedBy?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsIn(['pending', 'reviewing', 'approved', 'rejected'], { 
    message: 'status debe ser: pending, reviewing, approved o rejected' 
  })
  status?: string;
}