import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

// Mock de bcrypt a nivel de módulo
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  update: jest.fn(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test',
        rol: { name: 'user', rolPermissions: [] },
      };
      
      // Mock del método findByEmail
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      // Mock de bcrypt.compare para que retorne true
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', '123456');
      
      expect(result).toEqual(expect.objectContaining({ id: 1, email: 'test@test.com' }));
      expect(result.password).toBeUndefined();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@test.com', true);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      
      await expect(service.validateUser('wrong@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = { 
        id: 1, 
        email: 'test@test.com', 
        password: 'hashed',
        name: 'Test',
        rol: { name: 'user' }
      };
      
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      await expect(service.validateUser('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access_token and user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        rolId: 2,
        rol: { name: 'user', rolPermissions: [] },
      };
      
      mockJwtService.sign.mockReturnValue('fake-token');
      
      const result = await service.login(mockUser);
      
      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('id', 1);
      expect(result.user).toHaveProperty('email', 'test@test.com');
    });
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const registerDto = { 
        email: 'new@test.com', 
        password: '123456', 
        name: 'New', 
        rolId: 2 
      };
      
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 2, ...registerDto });
      mockJwtService.sign.mockReturnValue('fake-token');

      const result = await service.register(registerDto);
      
      expect(result).toHaveProperty('access_token');
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 1 });
      
      await expect(service.register({ 
        email: 'exists@test.com', 
        password: '123', 
        name: 'Test', 
        rolId: 2 
      })).rejects.toThrow(BadRequestException);
    });
  });
});