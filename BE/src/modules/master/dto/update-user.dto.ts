import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
