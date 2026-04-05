import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseHistoryController } from './exercise-history.controller';
import { ExerciseHistoryService } from './exercise-history.service';

describe('ExerciseHistoryController', () => {
  let controller: ExerciseHistoryController;
  let service: ExerciseHistoryService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByExercise: jest.fn(),
    findByDateRange: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeByUser: jest.fn(),
    getUserStats: jest.fn(),
    getGlobalStats: jest.fn(),
    getTodayHistory: jest.fn(),
    getCurrentWeekHistory: jest.fn(),
    getCurrentStreak: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseHistoryController],
      providers: [{ provide: ExerciseHistoryService, useValue: mockService }],
    }).compile();

    controller = module.get<ExerciseHistoryController>(ExerciseHistoryController);
    service = module.get<ExerciseHistoryService>(ExerciseHistoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all history', async () => {
      const mockData = { data: [], total: 0, page: 1, totalPages: 0 };
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll('1', '10', undefined, undefined, undefined, undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('getMyStats', () => {
    it('should return user stats', async () => {
      const mockStats = { totalCompletions: 5 };
      mockService.getUserStats.mockResolvedValue(mockStats);
      const result = await controller.getMyStats();
      expect(result).toEqual(mockStats);
    });
  });

  describe('create', () => {
    it('should create a history record', async () => {
      const createDto = { userId: 1, exerciseId: 2, completedAt: new Date() };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });
});