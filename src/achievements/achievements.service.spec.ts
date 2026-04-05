import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from '../user-achievements/entities/user-achievement.entity';

const mockAchievementRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserAchievementRepository = {
  count: jest.fn(),
};

describe('AchievementsService', () => {
  let service: AchievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: getRepositoryToken(Achievement), useValue: mockAchievementRepository },
        { provide: getRepositoryToken(UserAchievement), useValue: mockUserAchievementRepository },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an achievement', async () => {
      const createDto = { name: 'First Step', description: 'Complete first exercise', requirement: 'Do 1 exercise' };
      mockAchievementRepository.findOne.mockResolvedValue(null);
      mockAchievementRepository.create.mockReturnValue(createDto);
      mockAchievementRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if name exists', async () => {
      mockAchievementRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ name: 'Existing', description: '', requirement: '' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all achievements', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockAchievementRepository.find.mockResolvedValue(mockData);
      const result = await service.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findById', () => {
    it('should return an achievement', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockAchievementRepository.findOne.mockResolvedValue(mockData);
      const result = await service.findById(1);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException', async () => {
      mockAchievementRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return an achievement by name', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockAchievementRepository.findOne.mockResolvedValue(mockData);
      const result = await service.findByName('Test');
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException', async () => {
      mockAchievementRepository.findOne.mockResolvedValue(null);
      await expect(service.findByName('NotFound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an achievement', async () => {
      const updateDto = { name: 'Updated' };
      const mockAchievement = { id: 1, name: 'Old', description: 'Desc', requirement: 'Req' };
      mockAchievementRepository.findOne.mockResolvedValueOnce(mockAchievement);
      mockAchievementRepository.findOne.mockResolvedValueOnce(null);
      mockAchievementRepository.update.mockResolvedValue({ affected: 1 });
      mockAchievementRepository.findOne.mockResolvedValue({ ...mockAchievement, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException', async () => {
      mockAchievementRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name exists', async () => {
      const updateDto = { name: 'Existing' };
      const mockAchievement = { id: 1, name: 'Old' };
      mockAchievementRepository.findOne.mockResolvedValueOnce(mockAchievement);
      mockAchievementRepository.findOne.mockResolvedValueOnce({ id: 2, name: 'Existing' });
      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete an achievement', async () => {
      const mockAchievement = { id: 1, name: 'Test', userAchievements: [] };
      mockAchievementRepository.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepository.count.mockResolvedValue(0);
      mockAchievementRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });

    it('should throw BadRequestException if has user achievements', async () => {
      const mockAchievement = { id: 1, name: 'Test' };
      mockAchievementRepository.findOne.mockResolvedValue(mockAchievement);
      mockUserAchievementRepository.count.mockResolvedValue(5);
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});