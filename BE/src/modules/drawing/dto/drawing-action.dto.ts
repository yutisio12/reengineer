import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DrawingActionDto {
  @ApiProperty({ enum: ['start', 'stop', 'submit', 'return', 'approve'] })
  @IsString()
  @IsIn(['start', 'stop', 'submit', 'return', 'approve'])
  action: string;

  @ApiProperty({ enum: ['drafter', 'checker', 'engineer'] })
  @IsString()
  @IsIn(['drafter', 'checker', 'engineer'])
  stage: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  return_reason?: string;
}
