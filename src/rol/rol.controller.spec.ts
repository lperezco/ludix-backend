import { Test, TestingModule } from '@nestjs/testing';
import { RolController } from './rol.controller';
import { RolService } from './rol.service';

describe('RolController', () => {
  let controller: RolController;
  let rolService: RolService;

  const mockRolService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [{ provide: RolService, useValue: mockRolService }],
    }).compile();

    controller = module.get<RolController>(RolController);
    rolService = module.get<RolService>(RolService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const mockRoles = [{ id: 1, name: 'admin' }];
      mockRolService.findAll.mockResolvedValue(mockRoles);
      const result = await controller.findAll();
      expect(result).toEqual(mockRoles);
    });
  });

  describe('findOne', () => {
    it('should return a single role', async () => {
      const mockRol = { id: 1, name: 'admin' };
      mockRolService.findById.mockResolvedValue(mockRol);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockRol);
    });
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createDto = { name: 'moderator' };
      const mockRol = { id: 1, ...createDto };
      mockRolService.create.mockResolvedValue(mockRol);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockRol);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateDto = { name: 'updated' };
      const mockRol = { id: 1, name: 'updated' };
      mockRolService.update.mockResolvedValue(mockRol);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockRol);
    });
  });

  describe('remove', () => {
    it('should delete a role', async () => {
      mockRolService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockRolService.remove).toHaveBeenCalledWith(1);
    });
  });
});