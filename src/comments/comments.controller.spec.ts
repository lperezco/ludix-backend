import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByExercise: jest.fn(),
    findByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      const mockComments = [{ id: 1, content: 'Great!' }];
      mockService.findAll.mockResolvedValue(mockComments);
      const result = await controller.findAll();
      expect(result).toEqual(mockComments);
    });
  });

  describe('findByExercise', () => {
    it('should return comments by exercise', async () => {
      const mockComments = [{ id: 1, content: 'Great!' }];
      mockService.findByExercise.mockResolvedValue(mockComments);
      const result = await controller.findByExercise(1);
      expect(result).toEqual(mockComments);
      expect(mockService.findByExercise).toHaveBeenCalledWith(1);
    });
  });

  describe('findByUser', () => {
    it('should return comments by user', async () => {
      const mockComments = [{ id: 1, content: 'Great!' }];
      mockService.findByUser.mockResolvedValue(mockComments);
      const result = await controller.findByUser(1);
      expect(result).toEqual(mockComments);
      expect(mockService.findByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a single comment', async () => {
      const mockComment = { id: 1, content: 'Great!' };
      mockService.findById.mockResolvedValue(mockComment);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockComment);
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createDto = { userId: 1, exerciseId: 1, content: 'Great!' };
      const mockComment = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(mockComment);
      const result = await controller.create(createDto);
      expect(result).toEqual(mockComment);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateDto = { content: 'Updated content' };
      const mockComment = { id: 1, content: 'Updated content' };
      mockService.update.mockResolvedValue(mockComment);
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockComment);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const mockResponse = { message: 'Comentario eliminado' };
      mockService.remove.mockResolvedValue(mockResponse);
      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
    });
  });
});