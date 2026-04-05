import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { Exercise } from './entities/exercise.entity';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { ExerciseHistory } from '../exercise-history/entities/exercise-history.entity';

const mockExerciseRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockExerciseTypeRepository = {
  findOne: jest.fn(),
};

const mockFavoriteRepository = {
  count: jest.fn(),
  delete: jest.fn(),
};

const mockExerciseHistoryRepository = {
  count: jest.fn(),
  delete: jest.fn(),
};

describe('ExercisesService', () => {
  let service: ExercisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: getRepositoryToken(Exercise), useValue: mockExerciseRepository },
        { provide: getRepositoryToken(ExerciseType), useValue: mockExerciseTypeRepository },
        { provide: getRepositoryToken(Favorite), useValue: mockFavoriteRepository },
        { provide: getRepositoryToken(ExerciseHistory), useValue: mockExerciseHistoryRepository },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise successfully', async () => {
      const createDto = { name: 'Crazy 8s', description: 'Test', duration: 8, exerciseTypeId: 1, createdBy: 'admin' };
      mockExerciseRepository.findOne.mockResolvedValue(null);
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.create.mockReturnValue(createDto);
      mockExerciseRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if exercise name exists', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ name: 'Crazy 8s', description: 'Test', duration: 8, exerciseTypeId: 1 })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if exercise type not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      mockExerciseTypeRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ name: 'New', description: 'Test', duration: 5, exerciseTypeId: 999 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all exercises', async () => {
      const mockExercises = [{ id: 1, name: 'Crazy 8s' }];
      mockExerciseRepository.find.mockResolvedValue(mockExercises);

      const result = await service.findAll();
      expect(result).toEqual(mockExercises);
    });
  });

  describe('findById', () => {
    it('should return an exercise by id', async () => {
      const mockExercise = { id: 1, name: 'Crazy 8s' };
      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);

      const result = await service.findById(1);
      expect(result).toEqual(mockExercise);
    });

    it('should throw NotFoundException if not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByType', () => {
    it('should return exercises by type', async () => {
      const mockExercises = [{ id: 1, name: 'Crazy 8s', exerciseTypeId: 1 }];
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.find.mockResolvedValue(mockExercises);

      const result = await service.findByType(1);
      expect(result).toEqual(mockExercises);
    });

    it('should throw NotFoundException if type not found', async () => {
      mockExerciseTypeRepository.findOne.mockResolvedValue(null);
      await expect(service.findByType(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an exercise successfully', async () => {
      const updateDto = { name: 'Updated Exercise' };
      const mockExercise = { id: 1, name: 'Old Name' };
      mockExerciseRepository.findOne.mockResolvedValueOnce(mockExercise);
      mockExerciseRepository.findOne.mockResolvedValueOnce(null);
      mockExerciseRepository.update.mockResolvedValue({ affected: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ ...mockExercise, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.name).toBe('Updated Exercise');
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      const updateDto = { name: 'Existing Name' };
      const mockExercise = { id: 1, name: 'Old Name' };
      mockExerciseRepository.findOne.mockResolvedValueOnce(mockExercise);
      mockExerciseRepository.findOne.mockResolvedValueOnce({ id: 2, name: 'Existing Name' });

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });

    it('should update exerciseTypeId if provided and valid', async () => {
      const updateDto = { exerciseTypeId: 2 };
      const mockExercise = { id: 1, exerciseTypeId: 1 };
      mockExerciseRepository.findOne.mockResolvedValueOnce(mockExercise);
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 2 });
      mockExerciseRepository.update.mockResolvedValue({ affected: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ ...mockExercise, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.exerciseTypeId).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete an exercise successfully', async () => {
      const mockExercise = { id: 1, name: 'Crazy 8s' };
      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);
      mockFavoriteRepository.count.mockResolvedValue(0);
      mockExerciseHistoryRepository.count.mockResolvedValue(0);
      mockExerciseRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should delete associated favorites and history', async () => {
      const mockExercise = { id: 1, name: 'Crazy 8s' };
      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);
      mockFavoriteRepository.count.mockResolvedValue(5);
      mockExerciseHistoryRepository.count.mockResolvedValue(3);
      mockExerciseRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(mockFavoriteRepository.delete).toHaveBeenCalled();
      expect(mockExerciseHistoryRepository.delete).toHaveBeenCalled();
    });
  });
});