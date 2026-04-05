import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUsersController } from './blocked-users.controller';
import { BlockedUsersService } from './blocked-users.service';

describe('BlockedUsersController', () => {
  let controller: BlockedUsersController;
  let service: BlockedUsersService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findByBlocker: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    unblock: jest.fn(),
    isUserBlocked: jest.fn(),
    getStats: jest.fn(),
    getActiveBlock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockedUsersController],
      providers: [{ provide: BlockedUsersService, useValue: mockService }],
    }).compile();

    controller = module.get<BlockedUsersController>(BlockedUsersController);
    service = module.get<BlockedUsersService>(BlockedUsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all blocked users', async () => {
      const mockData = { data: [], total: 0, page: 1, totalPages: 0 };
      mockService.findAll.mockResolvedValue(mockData);
      const result = await controller.findAll('1', '10', 'true', undefined, undefined, undefined, undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should block a user', async () => {
      const createDto = { userId: 2, blockedBy: 1, reason: 'Spam', blockedAt: new Date() };
      const mockData = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockData);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockData);
    });
  });

  describe('unblock', () => {
    it('should unblock a user', async () => {
      const mockResponse = { message: 'Usuario desbloqueado' };
      mockService.unblock.mockResolvedValue(mockResponse);
      const result = await controller.unblock(2);
      expect(result).toEqual(mockResponse);
      expect(mockService.unblock).toHaveBeenCalledWith(2);
    });
  });
});