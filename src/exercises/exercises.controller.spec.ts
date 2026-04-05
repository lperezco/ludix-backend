import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let service: ExercisesService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [{ provide: ExercisesService, useValue: mockService }],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
    service = module.get<ExercisesService>(ExercisesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all exercises', async () => {
      const mockData = [{ id: 1, name: 'Crazy 8s' }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findByType', () => {
    it('should return exercises by type', async () => {
      const mockData = [{ id: 1, name: 'Crazy 8s' }];
      mockService.findByType.mockResolvedValue(mockData);
      const result = await controller.findByType(1);
      expect(result).toEqual(mockData);
      expect(mockService.findByType).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a single exercise', async () => {
      const mockData = { id: 1, name: 'Crazy 8s' };
      mockService.findById.mockResolvedValue(mockData);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create an exercise', async () => {
      const createDto = { name: 'New', description: 'Desc', duration: 5, exerciseTypeId: 1 };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      const updateDto = { name: 'Updated' };
      const mockData = { id: 1, name: 'Updated' };
      mockService.update.mockResolvedValue(mockData);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete an exercise', async () => {
      const mockResponse = { message: 'Ejercicio eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});