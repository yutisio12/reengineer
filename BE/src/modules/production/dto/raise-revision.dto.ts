import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RaiseRevisionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  revision_no: string;

  @ApiProperty()
  @IsString()
  description: string;
}
