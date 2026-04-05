import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseTypesController } from './exercise-types.controller';
import { ExerciseTypesService } from './exercise-types.service';

describe('ExerciseTypesController', () => {
  let controller: ExerciseTypesController;
  let service: ExerciseTypesService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseTypesController],
      providers: [{ provide: ExerciseTypesService, useValue: mockService }],
    }).compile();

    controller = module.get<ExerciseTypesController>(ExerciseTypesController);
    service = module.get<ExerciseTypesService>(ExerciseTypesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all exercise types', async () => {
      const mockData = [{ id: 1, type: 'Desbloqueo' }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('should return a single exercise type', async () => {
      const mockData = { id: 1, type: 'Desbloqueo' };
      mockService.findById.mockResolvedValue(mockData);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create an exercise type', async () => {
      const createDto = { type: 'Meditación' };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update an exercise type', async () => {
      const updateDto = { type: 'Updated' };
      const mockData = { id: 1, type: 'Updated' };
      mockService.update.mockResolvedValue(mockData);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete an exercise type', async () => {
      const mockResponse = { message: 'Tipo eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});