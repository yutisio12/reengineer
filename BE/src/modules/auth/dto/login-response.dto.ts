import { User } from '../../../entities/user.entity';

export class LoginResponseDto {
  token: string;
  user: Omit<User, 'password'>;
}
