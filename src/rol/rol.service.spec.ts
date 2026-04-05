import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RolService } from './rol.service';
import { Rol } from './entities/rol.entity';

const mockRolRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('RolService', () => {
  let service: RolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolService,
        { provide: getRepositoryToken(Rol), useValue: mockRolRepository },
      ],
    }).compile();

    service = module.get<RolService>(RolService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a rol', async () => {
      const createDto = { name: 'admin', description: 'Admin' };
      mockRolRepository.findOne.mockResolvedValue(null);
      mockRolRepository.create.mockReturnValue(createDto);
      mockRolRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if name exists', async () => {
      mockRolRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ name: 'admin' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      mockRolRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a rol', async () => {
      mockRolRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findByName', () => {
    it('should return a rol by name', async () => {
      mockRolRepository.findOne.mockResolvedValue({ id: 1, name: 'admin' });
      const result = await service.findByName('admin');
      expect(result).toHaveProperty('name', 'admin');
    });
  });

  describe('remove', () => {
    it('should delete a rol', async () => {
      mockRolRepository.findOne.mockResolvedValue({ id: 1, users: [] });
      mockRolRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockRolRepository.delete).toHaveBeenCalled();
    });
  });
});