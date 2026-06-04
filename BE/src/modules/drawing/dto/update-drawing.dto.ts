import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDrawingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  document_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  module_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  discipline_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  drawing_type_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigned_drafter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
