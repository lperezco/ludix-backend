import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let permissionsService: PermissionsService;

  const mockPermissionsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [{ provide: PermissionsService, useValue: mockPermissionsService }],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    permissionsService = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [{ id: 1, name: 'read_user' }];
      mockPermissionsService.findAll.mockResolvedValue(mockPermissions);
      const result = await controller.findAll();
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('findOne', () => {
    it('should return a single permission', async () => {
      const mockPermission = { id: 1, name: 'read_user' };
      mockPermissionsService.findById.mockResolvedValue(mockPermission);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const createDto = { name: 'write_user' };
      const mockPermission = { id: 1, ...createDto };
      mockPermissionsService.create.mockResolvedValue(mockPermission);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updateDto = { name: 'updated' };
      const mockPermission = { id: 1, name: 'updated' };
      mockPermissionsService.update.mockResolvedValue(mockPermission);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      mockPermissionsService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockPermissionsService.remove).toHaveBeenCalledWith(1);
    });
  });
});