import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let service: ProfilesService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [{ provide: ProfilesService, useValue: mockService }],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    service = module.get<ProfilesService>(ProfilesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all profiles', async () => {
      const mockData = [{ id: 1, userId: 1, creativeAreaId: 1 }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findByUserId', () => {
    it('should return profile by user id', async () => {
      const mockData = { id: 1, userId: 1, creativeAreaId: 1 };
      mockService.findByUserId.mockResolvedValue(mockData);
      const result = await controller.findByUserId(1);
      expect(result).toEqual(mockData);
      expect(mockService.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a profile', async () => {
      const createDto = { userId: 1, creativeAreaId: 1 };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const updateDto = { bio: 'New bio' };
      const mockData = { id: 1, bio: 'New bio' };
      mockService.update.mockResolvedValue(mockData);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete a profile', async () => {
      const mockResponse = { message: 'Perfil eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});