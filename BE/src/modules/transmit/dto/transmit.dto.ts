import { IsArray, IsString, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransmitDto {
  @ApiProperty({ isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  drawing_ids: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
