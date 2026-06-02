import { IsArray, IsString, IsOptional, ArrayMinSize } from 'class-validator';

export class TransmitDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  drawing_ids: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
