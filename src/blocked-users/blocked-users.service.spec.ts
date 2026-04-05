import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BlockedUsersService } from './blocked-users.service';
import { BlockedUser } from './entities/blocked-user.entity';
import { User } from '../users/entities/user.entity';

const mockBlockedUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue(null),
  })),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('BlockedUsersService', () => {
  let service: BlockedUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockedUsersService,
        { provide: getRepositoryToken(BlockedUser), useValue: mockBlockedUserRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<BlockedUsersService>(BlockedUsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should block a user successfully', async () => {
      const createDto = { userId: 2, blockedBy: 1, reason: 'Spam', blockedAt: new Date(), isActive: true };
      mockUserRepository.findOne.mockResolvedValueOnce({ id: 2 }).mockResolvedValueOnce({ id: 1 });
      mockBlockedUserRepository.findOne.mockResolvedValue(null);
      mockBlockedUserRepository.create.mockReturnValue(createDto);
      mockBlockedUserRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if user to block not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 999, blockedBy: 1, reason: 'Spam', blockedAt: new Date() })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if blocker not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ id: 2 }).mockResolvedValueOnce(null);
      await expect(service.create({ userId: 2, blockedBy: 999, reason: 'Spam', blockedAt: new Date() })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user tries to block themselves', async () => {
      // Primero mockeamos que el usuario existe (para que no falle por NotFoundException)
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ userId: 1, blockedBy: 1, reason: 'Spam', blockedAt: new Date() })).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user is already blocked', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ id: 2 }).mockResolvedValueOnce({ id: 1 });
      mockBlockedUserRepository.findOne.mockResolvedValue({ id: 1, isActive: true });
      await expect(service.create({ userId: 2, blockedBy: 1, reason: 'Spam', blockedAt: new Date() })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated blocked users', async () => {
      const mockData = [{ id: 1, userId: 2 }];
      mockBlockedUserRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.findAll(1, 10);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a blocked user record', async () => {
      const mockData = { id: 1, userId: 2 };
      mockBlockedUserRepository.findOne.mockResolvedValue(mockData);

      const result = await service.findById(1);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException if not found', async () => {
      mockBlockedUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return blocked records by user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 2 });
      mockBlockedUserRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByUser(2);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findByUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBlocker', () => {
    it('should return blocked records by blocker', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockBlockedUserRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByBlocker(1);
      expect(result).toBeDefined();
    });
  });

  describe('isUserBlocked', () => {
    it('should return true if user is blocked', async () => {
      mockBlockedUserRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.isUserBlocked(2);
      expect(result).toBe(true);
    });

    it('should return false if user is not blocked', async () => {
      mockBlockedUserRepository.findOne.mockResolvedValue(null);
      const result = await service.isUserBlocked(2);
      expect(result).toBe(false);
    });
  });

  describe('getActiveBlock', () => {
    it('should return active block', async () => {
      const mockBlock = { id: 1, userId: 2, isActive: true };
      mockBlockedUserRepository.findOne.mockResolvedValue(mockBlock);

      const result = await service.getActiveBlock(2);
      expect(result).toEqual(mockBlock);
    });
  });

  describe('unblock', () => {
    it('should unblock a user', async () => {
      mockBlockedUserRepository.findOne.mockResolvedValue({ id: 1, userId: 2, isActive: true });
      mockBlockedUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.unblock(2);
      expect(result.message).toContain('desbloqueado');
    });

    it('should throw NotFoundException if user not blocked', async () => {
      mockBlockedUserRepository.findOne.mockResolvedValue(null);
      await expect(service.unblock(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a blocked user record', async () => {
      const updateDto = { reason: 'Updated reason' };
      const mockBlocked = { id: 1, userId: 2, blockedBy: 1, reason: 'Old reason' };
      mockBlockedUserRepository.findOne.mockResolvedValue(mockBlocked);
      mockBlockedUserRepository.update.mockResolvedValue({ affected: 1 });
      mockBlockedUserRepository.findOne.mockResolvedValue({ ...mockBlocked, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.reason).toBe('Updated reason');
    });
  });

  describe('remove', () => {
    it('should delete a blocked user record', async () => {
      mockBlockedUserRepository.findOne.mockResolvedValue({ id: 1, userId: 2 });
      mockBlockedUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      mockBlockedUserRepository.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5);
      mockBlockedUserRepository.createQueryBuilder().getRawMany.mockResolvedValue([]);

      const result = await service.getStats();
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('active');
    });
  });

  describe('getExpiredBlocks', () => {
    it('should return expired blocks', async () => {
      mockBlockedUserRepository.find.mockResolvedValue([]);
      const result = await service.getExpiredBlocks(30);
      expect(result).toEqual([]);
    });
  });

  describe('expireOldBlocks', () => {
    it('should expire old blocks', async () => {
      mockBlockedUserRepository.find.mockResolvedValue([]);
      const result = await service.expireOldBlocks(30);
      expect(result.message).toContain('No hay bloqueos expirados');
    });
  });
});