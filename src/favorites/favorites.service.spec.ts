import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

const mockFavoriteRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockExerciseRepository = {
  findOne: jest.fn(),
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: mockFavoriteRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Exercise), useValue: mockExerciseRepository },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a favorite', async () => {
      const createDto = { userId: 1, exerciseId: 2 };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ id: 2 });
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      mockFavoriteRepository.create.mockReturnValue(createDto);
      mockFavoriteRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 999, exerciseId: 1 })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 1, exerciseId: 999 })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if favorite already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ id: 2 });
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ userId: 1, exerciseId: 2 })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all favorites', async () => {
      mockFavoriteRepository.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findById', () => {
    it('should return a favorite', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if not found', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return favorites by user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockFavoriteRepository.find.mockResolvedValue([]);
      const result = await service.findByUser(1);
      expect(result).toEqual([]);
    });
  });

  describe('findByExercise', () => {
    it('should return favorites by exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({ id: 2 });
      mockFavoriteRepository.find.mockResolvedValue([]);
      const result = await service.findByExercise(2);
      expect(result).toEqual([]);
    });
  });

  describe('isFavorite', () => {
    it('should return true if favorite exists', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.isFavorite(1, 2);
      expect(result).toBe(true);
    });

    it('should return false if favorite does not exist', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      const result = await service.isFavorite(1, 2);
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a favorite', async () => {
      const updateDto = { exerciseId: 3 };
      mockFavoriteRepository.findOne.mockResolvedValueOnce({ id: 1, userId: 1, exerciseId: 2 });
      mockFavoriteRepository.findOne.mockResolvedValueOnce({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ id: 3 });
      mockFavoriteRepository.update.mockResolvedValue({ affected: 1 });
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('remove', () => {
    it('should delete a favorite', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1 });
      mockFavoriteRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1);
      expect(result.message).toContain('eliminado');
    });
  });

  describe('removeByUserAndExercise', () => {
    it('should delete favorite by user and exercise', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1 });
      mockFavoriteRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.removeByUserAndExercise(1, 2);
      expect(result.message).toContain('eliminado');
    });

    it('should throw NotFoundException if favorite not found', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      await expect(service.removeByUserAndExercise(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite if not exists', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ id: 2 });
      mockFavoriteRepository.create.mockReturnValue({});
      mockFavoriteRepository.save.mockResolvedValue({ id: 1 });

      const result = await service.toggleFavorite(1, 2);
      expect(result.isFavorite).toBe(true);
    });

    it('should remove favorite if exists', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue({ id: 1 });
      mockFavoriteRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.toggleFavorite(1, 2);
      expect(result.isFavorite).toBe(false);
    });
  });
});