import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: FavoritesService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByExercise: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeByUserAndExercise: jest.fn(),
    toggleFavorite: jest.fn(),
    isFavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: mockService }],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    service = module.get<FavoritesService>(FavoritesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all favorites', async () => {
      const mockData = [{ id: 1, userId: 1, exerciseId: 1 }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findByUser', () => {
    it('should return favorites by user', async () => {
      const mockData = [{ id: 1, userId: 1, exerciseId: 1 }];
      mockService.findByUser.mockResolvedValue(mockData);
      const result = await controller.findByUser(1);
      expect(result).toEqual(mockData);
      expect(mockService.findByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('checkFavorite', () => {
    it('should return if exercise is favorite', async () => {
      mockService.isFavorite.mockResolvedValue(true);
      const result = await controller.checkFavorite(1, 2);
      expect(result).toEqual({ userId: 1, exerciseId: 2, isFavorite: true });
    });
  });

  describe('create', () => {
    it('should create a favorite', async () => {
      const createDto = { userId: 1, exerciseId: 2 };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const mockResponse = { isFavorite: true, message: 'Agregado' };
      mockService.toggleFavorite.mockResolvedValue(mockResponse);
      const result = await controller.toggleFavorite(1, 2);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeByUserAndExercise', () => {
    it('should remove favorite by user and exercise', async () => {
      const mockResponse = { message: 'Eliminado' };
      mockService.removeByUserAndExercise.mockResolvedValue(mockResponse);
      const result = await controller.removeByUserAndExercise(1, 2);
      expect(result).toEqual(mockResponse);
    });
  });
});