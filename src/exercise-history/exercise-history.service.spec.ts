import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistory } from './entities/exercise-history.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

const mockHistoryRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue(null),
  })),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockExerciseRepository = {
  findOne: jest.fn(),
};

describe('ExerciseHistoryService', () => {
  let service: ExerciseHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseHistoryService,
        { provide: getRepositoryToken(ExerciseHistory), useValue: mockHistoryRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Exercise), useValue: mockExerciseRepository },
      ],
    }).compile();

    service = module.get<ExerciseHistoryService>(ExerciseHistoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a history record', async () => {
      const createDto = { userId: 1, exerciseId: 1, completedAt: new Date() };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ id: 1 });
      mockHistoryRepository.create.mockReturnValue(createDto);
      mockHistoryRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 999, exerciseId: 1, completedAt: new Date() })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 1, exerciseId: 999, completedAt: new Date() })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated history', async () => {
      const mockData = [{ id: 1, userId: 1 }];
      mockHistoryRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.findAll(1, 10);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a history record', async () => {
      const mockData = { id: 1, userId: 1 };
      mockHistoryRepository.findOne.mockResolvedValue(mockData);

      const result = await service.findById(1);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException if not found', async () => {
      mockHistoryRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return history by user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockHistoryRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByUser(1);
      expect(result).toBeDefined();
    });
  });

  describe('findByExercise', () => {
    it('should return history by exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({ id: 1 });
      mockHistoryRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByExercise(1);
      expect(result).toBeDefined();
    });
  });

  describe('getTodayHistory', () => {
    it('should return today history', async () => {
      mockHistoryRepository.find.mockResolvedValue([]);
      const result = await service.getTodayHistory(1);
      expect(result).toEqual([]);
    });
  });

  describe('getCurrentWeekHistory', () => {
    it('should return current week history', async () => {
      mockHistoryRepository.find.mockResolvedValue([]);
      const result = await service.getCurrentWeekHistory(1);
      expect(result).toEqual([]);
    });
  });

  describe('getCurrentStreak', () => {
    it('should return streak count', async () => {
      mockHistoryRepository.find.mockResolvedValue([]);
      const result = await service.getCurrentStreak(1);
      expect(result).toBe(0);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, name: 'Test User' });
      mockHistoryRepository.count.mockResolvedValue(10);
      mockHistoryRepository.createQueryBuilder().getRawMany.mockResolvedValue([]);

      const result = await service.getUserStats(1);
      expect(result).toHaveProperty('totalCompletions');
      expect(result).toHaveProperty('userName');
    });
  });

  describe('getGlobalStats', () => {
    it('should return global statistics', async () => {
      mockHistoryRepository.count.mockResolvedValue(100);
      mockHistoryRepository.createQueryBuilder().getRawOne.mockResolvedValue({ count: 10 });
      mockHistoryRepository.createQueryBuilder().getRawMany.mockResolvedValue([]);

      const result = await service.getGlobalStats();
      expect(result).toHaveProperty('totalCompletions');
      expect(result).toHaveProperty('activeUsers');
    });
  });

  describe('update', () => {
    it('should update a history record', async () => {
      const updateDto = { completedAt: new Date() };
      const mockData = { id: 1, userId: 1, exerciseId: 1 };
      mockHistoryRepository.findOne.mockResolvedValue(mockData);
      mockHistoryRepository.update.mockResolvedValue({ affected: 1 });
      mockHistoryRepository.findOne.mockResolvedValue({ ...mockData, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('remove', () => {
    it('should delete a history record', async () => {
      const mockData = { id: 1, userId: 1, exercise: { name: 'Test' } };
      mockHistoryRepository.findOne.mockResolvedValue(mockData);
      mockHistoryRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });
  });

  describe('removeByUser', () => {
    it('should delete all history of a user', async () => {
      mockHistoryRepository.count.mockResolvedValue(5);
      mockHistoryRepository.delete.mockResolvedValue({ affected: 5 });

      const result = await service.removeByUser(1);
      expect(result).toHaveProperty('message');
    });
  });
});