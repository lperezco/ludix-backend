import { Test, TestingModule } from '@nestjs/testing';
import { CreativeAreasController } from './creative-areas.controller';
import { CreativeAreasService } from './creative-areas.service';

describe('CreativeAreasController', () => {
  let controller: CreativeAreasController;
  let service: CreativeAreasService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreativeAreasController],
      providers: [{ provide: CreativeAreasService, useValue: mockService }],
    }).compile();

    controller = module.get<CreativeAreasController>(CreativeAreasController);
    service = module.get<CreativeAreasService>(CreativeAreasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all creative areas', async () => {
      const mockData = [{ id: 1, area: 'Diseño Gráfico' }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('should return a single creative area', async () => {
      const mockData = { id: 1, area: 'Diseño Gráfico' };
      mockService.findById.mockResolvedValue(mockData);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create a creative area', async () => {
      const createDto = { area: 'Animación' };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update a creative area', async () => {
      const updateDto = { area: 'Updated' };
      const mockData = { id: 1, area: 'Updated' };
      mockService.update.mockResolvedValue(mockData);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('remove', () => {
    it('should delete a creative area', async () => {
      const mockResponse = { message: 'Área eliminada' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});