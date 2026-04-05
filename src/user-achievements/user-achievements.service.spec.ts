import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserAchievementsService } from './user-achievements.service';
import { UserAchievement } from './entities/user-achievement.entity';
import { User } from '../users/entities/user.entity';
import { Achievement } from '../achievements/entities/achievement.entity';

const mockUserAchievementRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockAchievementRepository = {
  findOne: jest.fn(),
};

describe('UserAchievementsService', () => {
  let service: UserAchievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAchievementsService,
        { provide: getRepositoryToken(UserAchievement), useValue: mockUserAchievementRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Achievement), useValue: mockAchievementRepository },
      ],
    }).compile();

    service = module.get<UserAchievementsService>(UserAchievementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user achievement successfully', async () => {
      const createDto = { userId: 1, achievementId: 1, dateOfAchievement: new Date() };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockAchievementRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserAchievementRepository.findOne.mockResolvedValue(null);
      mockUserAchievementRepository.create.mockReturnValue(createDto);
      mockUserAchievementRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 999, achievementId: 1, dateOfAchievement: new Date() })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if achievement not found', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockAchievementRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 1, achievementId: 999, dateOfAchievement: new Date() })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user already has achievement', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockAchievementRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserAchievementRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ userId: 1, achievementId: 1, dateOfAchievement: new Date() })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all user achievements', async () => {
      const mockData = [{ id: 1, userId: 1, achievementId: 1 }];
      mockUserAchievementRepository.find.mockResolvedValue(mockData);

      const result = await service.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findById', () => {
    it('should return a user achievement by id', async () => {
      const mockData = { id: 1, userId: 1, achievementId: 1 };
      mockUserAchievementRepository.findOne.mockResolvedValue(mockData);

      const result = await service.findById(1);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserAchievementRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return achievements by user', async () => {
      const mockData = [{ id: 1, userId: 1, achievementId: 1 }];
      mockUserAchievementRepository.find.mockResolvedValue(mockData);

      const result = await service.findByUser(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('findByAchievement', () => {
    it('should return users by achievement', async () => {
      const mockData = [{ id: 1, userId: 1, achievementId: 1 }];
      mockUserAchievementRepository.find.mockResolvedValue(mockData);

      const result = await service.findByAchievement(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('hasAchievement', () => {
    it('should return true if user has achievement', async () => {
      mockUserAchievementRepository.count.mockResolvedValue(1);
      const result = await service.hasAchievement(1, 1);
      expect(result).toBe(true);
    });

    it('should return false if user does not have achievement', async () => {
      mockUserAchievementRepository.count.mockResolvedValue(0);
      const result = await service.hasAchievement(1, 1);
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a user achievement', async () => {
      const updateDto = { dateOfAchievement: new Date() };
      const mockData = { id: 1, userId: 1, achievementId: 1 };
      mockUserAchievementRepository.findOne.mockResolvedValue(mockData);
      mockUserAchievementRepository.update.mockResolvedValue({ affected: 1 });
      mockUserAchievementRepository.findOne.mockResolvedValue({ ...mockData, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserAchievementRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user achievement', async () => {
      mockUserAchievementRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserAchievementRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });
  });

  describe('removeAllByUser', () => {
    it('should delete all achievements of a user', async () => {
      mockUserAchievementRepository.delete.mockResolvedValue({ affected: 5 });

      const result = await service.removeAllByUser(1);
      expect(result).toHaveProperty('message');
    });
  });
});