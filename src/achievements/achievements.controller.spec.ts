import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

describe('AchievementsController', () => {
  let controller: AchievementsController;
  let service: AchievementsService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementsController],
      providers: [{ provide: AchievementsService, useValue: mockService }],
    }).compile();

    controller = module.get<AchievementsController>(AchievementsController);
    service = module.get<AchievementsService>(AchievementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all achievements', async () => {
      const mockData = [{ id: 1, name: 'First Step' }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('should return a single achievement', async () => {
      const mockData = { id: 1, name: 'First Step' };
      mockService.findById.mockResolvedValue(mockData);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create an achievement', async () => {
      const createDto = { name: 'New', description: 'Desc', requirement: 'Req' };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update an achievement', async () => {
      const updateDto = { name: 'Updated' };
      const mockData = { id: 1, name: 'Updated' };
      mockService.update.mockResolvedValue(mockData);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete an achievement', async () => {
      const mockResponse = { message: 'Logro eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});