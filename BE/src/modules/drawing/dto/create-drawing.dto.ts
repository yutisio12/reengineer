import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDrawingDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  document_no: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  company_id: string;

  @ApiProperty()
  @IsUUID()
  project_id: string;

  @ApiProperty()
  @IsUUID()
  module_id: string;

  @ApiProperty()
  @IsUUID()
  discipline_id: string;

  @ApiProperty()
  @IsUUID()
  drawing_type_id: string;

  @ApiProperty()
  @IsUUID()
  assigned_drafter: string;
}
