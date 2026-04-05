import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, email: 'test@test.com' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();
      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { email: 'new@test.com', password: '123456', name: 'New', rolId: 2 };
      const mockUser = { id: 1, ...createDto };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createDto);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Updated Name' };
      const mockUser = { id: 1, email: 'test@test.com', name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockResponse = { message: 'Usuario eliminado' };
      mockUsersService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(1);
      expect(result).toEqual(mockResponse);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });
});