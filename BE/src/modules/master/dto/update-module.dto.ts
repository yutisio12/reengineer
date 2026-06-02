import { IsString, IsBoolean, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
