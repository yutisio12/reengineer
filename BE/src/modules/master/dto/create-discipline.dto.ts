import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateDisciplineDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;
}
