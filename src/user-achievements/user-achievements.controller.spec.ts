import { Test, TestingModule } from '@nestjs/testing';
import { UserAchievementsController } from './user-achievements.controller';
import { UserAchievementsService } from './user-achievements.service';

describe('UserAchievementsController', () => {
  let controller: UserAchievementsController;
  let service: UserAchievementsService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByAchievement: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAllByUser: jest.fn(),
    hasAchievement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAchievementsController],
      providers: [{ provide: UserAchievementsService, useValue: mockService }],
    }).compile();

    controller = module.get<UserAchievementsController>(UserAchievementsController);
    service = module.get<UserAchievementsService>(UserAchievementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all user achievements', async () => {
      const mockData = [{ id: 1, userId: 1, achievementId: 1 }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findByUser', () => {
    it('should return achievements by user', async () => {
      const mockData = [{ id: 1, userId: 1, achievementId: 1 }];
      mockService.findByUser.mockResolvedValue(mockData);
      const result = await controller.findByUser(1);
      expect(result).toEqual(mockData);
      expect(mockService.findByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('checkAchievement', () => {
    it('should return if user has achievement', async () => {
      mockService.hasAchievement.mockResolvedValue(true);
      const result = await controller.checkAchievement(1, 2);
      expect(result).toEqual({ userId: 1, achievementId: 2, has: true });
    });
  });

  describe('create', () => {
    it('should create a user achievement', async () => {
      const createDto = { userId: 1, achievementId: 2, dateOfAchievement: new Date() };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete a user achievement', async () => {
      const mockResponse = { message: 'Logro eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeAllByUser', () => {
    it('should delete all achievements of a user', async () => {
      const mockResponse = { message: 'Todos los logros eliminados' };
      mockService.removeAllByUser.mockResolvedValue(mockResponse);
      const result = await controller.removeAllByUser(1);
      expect(result).toEqual(mockResponse);
      expect(mockService.removeAllByUser).toHaveBeenCalledWith(1);
    });
  });
});