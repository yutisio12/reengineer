import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-engineering-tracker-2026',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('JwtStrategy.validate CALLED with payload:', JSON.stringify(payload));
    console.log('JWT_SECRET used:', process.env.JWT_SECRET || '(not set)');
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, is_active: true },
    });
    if (!user || !user.is_active) {
      console.log('JwtStrategy.validate FAILED - user not found or inactive');
      throw new UnauthorizedException('User not found or inactive');
    }
    console.log('JwtStrategy.validate SUCCESS - user found:', user.id);
    return user;
  }
}
