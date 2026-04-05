import {
  IsInt,
  IsString,
  IsNotEmpty,
  Min,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  commentId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  reportedBy: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsIn(['pending', 'reviewing', 'approved', 'rejected'])
  status?: string;
}
