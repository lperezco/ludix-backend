import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

const mockCommentRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository = { findOne: jest.fn() };
const mockExerciseRepository = { findOne: jest.fn() };

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Exercise), useValue: mockExerciseRepository },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createDto = { userId: 1, exerciseId: 1, content: 'Great!' };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockExerciseRepository.findOne.mockResolvedValue({ id: 1 });
      mockCommentRepository.create.mockReturnValue(createDto);
      mockCommentRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      mockCommentRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a comment', async () => {
      mockCommentRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findByExercise', () => {
    it('should return comments by exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue({ id: 1 });
      mockCommentRepository.find.mockResolvedValue([]);
      const result = await service.findByExercise(1);
      expect(result).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('should return comments by user', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockCommentRepository.find.mockResolvedValue([]);
      const result = await service.findByUser(1);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateDto = { content: 'Updated' };
      mockCommentRepository.findOne.mockResolvedValue({ id: 1, content: 'Old' });
      mockCommentRepository.update.mockResolvedValue({ affected: 1 });
      mockCommentRepository.findOne.mockResolvedValue({ id: 1, content: 'Updated' });

      const result = await service.update(1, updateDto);
      expect(result.content).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockCommentRepository.findOne.mockResolvedValue({ id: 1, replies: [] });
      mockCommentRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });
  });
});