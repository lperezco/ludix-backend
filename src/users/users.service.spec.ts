import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Rol } from '../rol/entities/rol.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRolRepository = { findOne: jest.fn() };
const mockConfigService = { get: jest.fn().mockReturnValue('10') };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Rol), useValue: mockRolRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { email: 'test@test.com', password: '123', name: 'Test', rolId: 1 };
      mockUserRepository.findOne.mockResolvedValue(null);
      mockRolRepository.findOne.mockResolvedValue({ id: 1 });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserRepository.create.mockReturnValue(createDto);
      mockUserRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });
      const result = await service.findByEmail('test@test.com');
      expect(result).toHaveProperty('email', 'test@test.com');
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, name: 'Test' });
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });
  });
});