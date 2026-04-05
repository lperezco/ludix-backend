import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

const mockReportRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCommentRepository = {
  findOne: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Report), useValue: mockReportRepository },
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a report', async () => {
      const createDto = { commentId: 1, reportedBy: 2, reason: 'Spam', status: 'pending' };
      mockCommentRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.findOne.mockResolvedValue({ id: 2 });
      mockReportRepository.findOne.mockResolvedValue(null);
      mockReportRepository.create.mockReturnValue(createDto);
      mockReportRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ commentId: 999, reportedBy: 1, reason: 'Spam' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if reporter not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ commentId: 1, reportedBy: 999, reason: 'Spam' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if pending report exists', async () => {
      mockCommentRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.findOne.mockResolvedValue({ id: 2 });
      mockReportRepository.findOne.mockResolvedValue({ id: 1, status: 'pending' });
      await expect(service.create({ commentId: 1, reportedBy: 2, reason: 'Spam' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      mockReportRepository.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('findById', () => {
    it('should return a report', async () => {
      mockReportRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if not found', async () => {
      mockReportRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return reports by user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 2 });
      mockReportRepository.find.mockResolvedValue([]);
      const result = await service.findByUser(2);
      expect(result).toEqual([]);
    });
  });

  describe('findByComment', () => {
    it('should return reports by comment', async () => {
      mockCommentRepository.findOne.mockResolvedValue({ id: 1 });
      mockReportRepository.find.mockResolvedValue([]);
      const result = await service.findByComment(1);
      expect(result).toEqual([]);
    });
  });

  describe('findByStatus', () => {
    it('should return reports by status', async () => {
      mockReportRepository.find.mockResolvedValue([]);
      const result = await service.findByStatus('pending');
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.findByStatus('invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update report status', async () => {
      mockReportRepository.findOne.mockResolvedValue({ id: 1, status: 'pending' });
      mockReportRepository.update.mockResolvedValue({ affected: 1 });
      mockReportRepository.findOne.mockResolvedValue({ id: 1, status: 'approved' });

      const result = await service.updateStatus(1, 'approved');
      expect(result.status).toBe('approved');
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.updateStatus(1, 'invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a report', async () => {
      const updateDto = { reason: 'Updated reason' };
      mockReportRepository.findOne.mockResolvedValueOnce({ id: 1 });
      mockReportRepository.update.mockResolvedValue({ affected: 1 });
      mockReportRepository.findOne.mockResolvedValue({ id: 1, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('remove', () => {
    it('should delete a report', async () => {
      mockReportRepository.findOne.mockResolvedValue({ id: 1 });
      mockReportRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1);
      expect(result.message).toContain('eliminado');
    });
  });

  describe('removeByComment', () => {
    it('should delete all reports for a comment', async () => {
      mockReportRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockReportRepository.delete.mockResolvedValue({ affected: 2 });
      const result = await service.removeByComment(1);
      expect(result.message).toContain('eliminaron');
    });

    it('should throw NotFoundException if no reports', async () => {
      mockReportRepository.find.mockResolvedValue([]);
      await expect(service.removeByComment(1)).rejects.toThrow(NotFoundException);
    });
  });
});