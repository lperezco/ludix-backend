import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ExerciseTypesService } from './exercise-types.service';
import { ExerciseType } from './entities/exercise-type.entity';

const mockExerciseTypeRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ExerciseTypesService', () => {
  let service: ExerciseTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseTypesService,
        { provide: getRepositoryToken(ExerciseType), useValue: mockExerciseTypeRepository },
      ],
    }).compile();

    service = module.get<ExerciseTypesService>(ExerciseTypesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise type', async () => {
      const createDto = { type: 'Cardio' };
      mockExerciseTypeRepository.findOne.mockResolvedValue(null);
      mockExerciseTypeRepository.create.mockReturnValue(createDto);
      mockExerciseTypeRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException', async () => {
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ type: 'Exists' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all exercise types', async () => {
      mockExerciseTypeRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return an exercise type', async () => {
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findByType', () => {
    it('should return an exercise type by name', async () => {
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1, type: 'Cardio' });
      const result = await service.findByType('Cardio');
      expect(result).toHaveProperty('type', 'Cardio');
    });
  });

  describe('update', () => {
    it('should update an exercise type', async () => {
      const updateDto = { type: 'Updated' };
      mockExerciseTypeRepository.findOne.mockResolvedValueOnce({ id: 1, type: 'Old' });
      mockExerciseTypeRepository.findOne.mockResolvedValueOnce(null);
      mockExerciseTypeRepository.update.mockResolvedValue({ affected: 1 });
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1, type: 'Updated' });

      const result = await service.update(1, updateDto);
      expect(result.type).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete an exercise type', async () => {
      mockExerciseTypeRepository.findOne.mockResolvedValue({ id: 1, exercises: [], challenges: [] });
      mockExerciseTypeRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });
  });
});