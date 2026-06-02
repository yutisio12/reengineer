import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @IsUUID()
  project_id: string;
}
