import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { SeedService } from '../../seed/seed.service';

@ApiTags('Authentication')
@Controller('engineering/api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private seedService: SeedService,
  ) {}

  @ApiOperation({ summary: 'Sign in with username and password' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @ApiOperation({ summary: 'Seed database with initial data' })
  @Get('seed')
  seed() {
    return this.seedService.seed();
  }
}
