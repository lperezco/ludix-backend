import { Test, TestingModule } from '@nestjs/testing';
import { RolPermissionsController } from './rol-permissions.controller';
import { RolPermissionsService } from './rol-permissions.service';

describe('RolPermissionsController', () => {
  let controller: RolPermissionsController;
  let service: RolPermissionsService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByRol: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolPermissionsController],
      providers: [{ provide: RolPermissionsService, useValue: mockService }],
    }).compile();

    controller = module.get<RolPermissionsController>(RolPermissionsController);
    service = module.get<RolPermissionsService>(RolPermissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all rol-permissions', async () => {
      const mockData = [{ id: 1, rolId: 1, permissionId: 1 }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('should return a single rol-permission', async () => {
      const mockData = { id: 1, rolId: 1, permissionId: 1 };
      mockService.findById.mockResolvedValue(mockData);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('findByRol', () => {
    it('should return permissions by rol', async () => {
      const mockData = [{ id: 1, rolId: 1, permissionId: 1 }];
      mockService.findByRol.mockResolvedValue(mockData);
      const result = await controller.findByRol(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create a rol-permission', async () => {
      const createDto = { rolId: 1, permissionId: 2 };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update a rol-permission', async () => {
      const updateDto = { rolId: 2 };
      const mockData = { id: 1, rolId: 2, permissionId: 1 };
      mockService.update.mockResolvedValue(mockData);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete a rol-permission', async () => {
      mockService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});