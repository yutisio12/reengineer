import { IsString, IsIn, IsOptional } from 'class-validator';

export class DrawingActionDto {
  @IsString()
  @IsIn(['start', 'stop', 'submit', 'return', 'approve'])
  action: string;

  @IsString()
  @IsIn(['drafter', 'checker', 'engineer'])
  stage: string;

  @IsOptional()
  @IsString()
  return_reason?: string;
}
