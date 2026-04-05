import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RolPermissionsService } from './rol-permissions.service';
import { RolPermission } from './entities/rol-permission.entity';
import { RolService } from '../rol/rol.service';
import { PermissionsService } from '../permissions/permissions.service';

const mockRolPermissionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRolService = { findById: jest.fn() };
const mockPermissionsService = { findById: jest.fn() };

describe('RolPermissionsService', () => {
  let service: RolPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolPermissionsService,
        { provide: getRepositoryToken(RolPermission), useValue: mockRolPermissionRepository },
        { provide: RolService, useValue: mockRolService },
        { provide: PermissionsService, useValue: mockPermissionsService },
      ],
    }).compile();

    service = module.get<RolPermissionsService>(RolPermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a rol-permission', async () => {
      const createDto = { rolId: 1, permissionId: 2 };
      mockRolService.findById.mockResolvedValue({ id: 1 });
      mockPermissionsService.findById.mockResolvedValue({ id: 2 });
      mockRolPermissionRepository.findOne.mockResolvedValue(null);
      mockRolPermissionRepository.create.mockReturnValue(createDto);
      mockRolPermissionRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all rol-permissions', async () => {
      mockRolPermissionRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a rol-permission', async () => {
      mockRolPermissionRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findByRol', () => {
    it('should return permissions by rol', async () => {
      mockRolPermissionRepository.find.mockResolvedValue([]);
      const result = await service.findByRol(1);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a rol-permission', async () => {
      const updateDto = { rolId: 2 };
      mockRolPermissionRepository.findOne.mockResolvedValue({ id: 1, rolId: 1, permissionId: 1 });
      mockRolService.findById.mockResolvedValue({ id: 2 });
      mockRolPermissionRepository.update.mockResolvedValue({ affected: 1 });
      mockRolPermissionRepository.findOne.mockResolvedValue({ id: 1, rolId: 2, permissionId: 1 });

      const result = await service.update(1, updateDto);
      expect(result.rolId).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete a rol-permission', async () => {
      mockRolPermissionRepository.findOne.mockResolvedValue({ id: 1 });
      mockRolPermissionRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockRolPermissionRepository.delete).toHaveBeenCalled();
    });
  });

  describe('removeByRol', () => {
    it('should delete all permissions of a rol', async () => {
      mockRolPermissionRepository.delete.mockResolvedValue({ affected: 3 });
      await service.removeByRol(1);
      expect(mockRolPermissionRepository.delete).toHaveBeenCalled();
    });
  });
});