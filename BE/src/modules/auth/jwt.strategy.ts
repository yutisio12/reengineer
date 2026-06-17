import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

const JWT_SECRET = 'super-secret-key-engineering-tracker-2026';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('[JwtStrategy] validate called', { payload, sub: payload.sub, email: payload.email });
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, is_active: true },
    });
    console.log('[JwtStrategy] user lookup result', { found: !!user, is_active: user?.is_active, id: user?.id });
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
