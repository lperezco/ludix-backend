import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreativeArea } from '../creative-areas/entities/creative-area.entity';

const mockProfileRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockCreativeAreaRepository = {
  findOne: jest.fn(),
};

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(CreativeArea), useValue: mockCreativeAreaRepository },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile successfully', async () => {
      const createDto = { userId: 1, creativeAreaId: 1, bio: 'Test bio' };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockCreativeAreaRepository.findOne.mockResolvedValue({ id: 1 });
      mockProfileRepository.create.mockReturnValue(createDto);
      mockProfileRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 999, creativeAreaId: 1 })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if profile already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockProfileRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ userId: 1, creativeAreaId: 1 })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if creative area not found', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockProfileRepository.findOne.mockResolvedValue(null);
      mockCreativeAreaRepository.findOne.mockResolvedValue(null);
      await expect(service.create({ userId: 1, creativeAreaId: 999 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all profiles', async () => {
      const mockProfiles = [{ id: 1, userId: 1 }];
      mockProfileRepository.find.mockResolvedValue(mockProfiles);

      const result = await service.findAll();
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('findById', () => {
    it('should return a profile by id', async () => {
      const mockProfile = { id: 1, userId: 1 };
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findById(1);
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return a profile by user id', async () => {
      const mockProfile = { id: 1, userId: 1 };
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findByUserId(1);
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);
      await expect(service.findByUserId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a profile successfully', async () => {
      const updateDto = { bio: 'Updated bio' };
      const mockProfile = { id: 1, userId: 1, bio: 'Old bio' };
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.update.mockResolvedValue({ affected: 1 });
      mockProfileRepository.findOne.mockResolvedValue({ ...mockProfile, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.bio).toBe('Updated bio');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should update userId if provided and valid', async () => {
      const updateDto = { userId: 2 };
      const mockProfile = { id: 1, userId: 1 };
      mockProfileRepository.findOne.mockResolvedValueOnce(mockProfile);
      mockUserRepository.findOne.mockResolvedValue({ id: 2 });
      mockProfileRepository.findOne.mockResolvedValueOnce(null);
      mockProfileRepository.update.mockResolvedValue({ affected: 1 });
      mockProfileRepository.findOne.mockResolvedValue({ ...mockProfile, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.userId).toBe(2);
    });

    it('should throw ConflictException if new userId already has a profile', async () => {
      const updateDto = { userId: 2 };
      const mockProfile = { id: 1, userId: 1 };
      mockProfileRepository.findOne.mockResolvedValueOnce(mockProfile);
      mockUserRepository.findOne.mockResolvedValue({ id: 2 });
      mockProfileRepository.findOne.mockResolvedValueOnce({ id: 2, userId: 2 });

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });

    it('should update creativeAreaId if provided and valid', async () => {
      const updateDto = { creativeAreaId: 2 };
      const mockProfile = { id: 1, creativeAreaId: 1 };
      mockProfileRepository.findOne.mockResolvedValueOnce(mockProfile);
      mockCreativeAreaRepository.findOne.mockResolvedValue({ id: 2 });
      mockProfileRepository.update.mockResolvedValue({ affected: 1 });
      mockProfileRepository.findOne.mockResolvedValue({ ...mockProfile, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.creativeAreaId).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete a profile successfully', async () => {
      const mockProfile = { id: 1, userId: 1 };
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockProfileRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});