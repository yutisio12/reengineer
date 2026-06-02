import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateDisciplineDto {
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
}
