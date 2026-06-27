import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    role: UserRole.ENGINEER,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };

    it('should return token and user on successful login', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.login(loginDto);

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect((result.user as any).password).toBeUndefined();
      expect(result.user.email).toBe('test@example.com');
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: { id: true, name: true, email: true, password: true, role: true, is_active: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });

    it('should throw UnauthorizedException when email is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedException when account is inactive', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, is_active: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Account is inactive');
    });

    it('should throw UnauthorizedException when user not found AND inactive check is bypassed', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user without password when found', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await authService.getProfile('user-1');

      expect(result).toBeDefined();
      expect((result as any).password).toBeUndefined();
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent-id')).rejects.toThrow(UnauthorizedException);
      await expect(authService.getProfile('nonexistent-id')).rejects.toThrow('User not found');
    });
  });
});
