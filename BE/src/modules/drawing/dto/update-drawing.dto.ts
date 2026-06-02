import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateDrawingDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  document_no?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsUUID()
  module_id?: string;

  @IsOptional()
  @IsUUID()
  discipline_id?: string;

  @IsOptional()
  @IsUUID()
  drawing_type_id?: string;

  @IsOptional()
  @IsUUID()
  assigned_drafter?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
