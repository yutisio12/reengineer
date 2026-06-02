import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateDrawingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  document_no: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  company_id: string;

  @IsUUID()
  project_id: string;

  @IsUUID()
  module_id: string;

  @IsUUID()
  discipline_id: string;

  @IsUUID()
  drawing_type_id: string;

  @IsUUID()
  assigned_drafter: string;
}
