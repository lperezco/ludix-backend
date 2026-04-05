import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';

const mockPermissionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useValue: mockPermissionRepository },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const createDto = { name: 'read_user' };
      mockPermissionRepository.findOne.mockResolvedValue(null);
      mockPermissionRepository.create.mockReturnValue(createDto);
      mockPermissionRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      mockPermissionRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a permission', async () => {
      mockPermissionRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findByName', () => {
    it('should return a permission by name', async () => {
      mockPermissionRepository.findOne.mockResolvedValue({ id: 1, name: 'read' });
      const result = await service.findByName('read');
      expect(result).toHaveProperty('name', 'read');
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      mockPermissionRepository.findOne.mockResolvedValue({ id: 1 });
      mockPermissionRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockPermissionRepository.delete).toHaveBeenCalled();
    });
  });
});