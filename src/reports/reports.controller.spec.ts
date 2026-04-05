import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByPost: jest.fn(),
    findByStatus: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
    removeByPost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      const mockData = [{ id: 1, postId: 1, reason: 'Spam' }];
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create a report', async () => {
      const createDto = { postId: 1, reportedBy: 1, reason: 'Spam' };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('updateStatus', () => {
    it('should update report status', async () => {
      const mockData = { id: 1, status: 'approved' };
      mockService.updateStatus.mockResolvedValue(mockData);
      const result = await controller.updateStatus(1, 'approved');
      expect(result).toEqual(mockData);
      expect(mockService.updateStatus).toHaveBeenCalledWith(1, 'approved');
    });
  });

  describe('remove', () => {
    it('should delete a report', async () => {
      const mockResponse = { message: 'Reporte eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});