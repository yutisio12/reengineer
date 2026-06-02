import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRevisionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  revision_no: string;

  @IsString()
  description: string;
}
