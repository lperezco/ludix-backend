import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreativeAreasService } from './creative-areas.service';
import { CreativeArea } from './entities/creative-area.entity';
import { Profile } from '../profiles/entities/profile.entity';

const mockCreativeAreaRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockProfileRepository = {
  find: jest.fn(),
};

describe('CreativeAreasService', () => {
  let service: CreativeAreasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreativeAreasService,
        { provide: getRepositoryToken(CreativeArea), useValue: mockCreativeAreaRepository },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
      ],
    }).compile();

    service = module.get<CreativeAreasService>(CreativeAreasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a creative area successfully', async () => {
      const createDto = { area: 'Diseño Gráfico' };
      mockCreativeAreaRepository.findOne.mockResolvedValue(null);
      mockCreativeAreaRepository.create.mockReturnValue(createDto);
      mockCreativeAreaRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if area already exists', async () => {
      mockCreativeAreaRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.create({ area: 'Diseño Gráfico' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all creative areas', async () => {
      const mockAreas = [{ id: 1, area: 'Diseño Gráfico' }];
      mockCreativeAreaRepository.find.mockResolvedValue(mockAreas);

      const result = await service.findAll();
      expect(result).toEqual(mockAreas);
    });
  });

  describe('findById', () => {
    it('should return a creative area by id', async () => {
      const mockArea = { id: 1, area: 'Diseño Gráfico' };
      mockCreativeAreaRepository.findOne.mockResolvedValue(mockArea);

      const result = await service.findById(1);
      expect(result).toEqual(mockArea);
    });

    it('should throw NotFoundException if not found', async () => {
      mockCreativeAreaRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByArea', () => {
    it('should return a creative area by name', async () => {
      const mockArea = { id: 1, area: 'Diseño Gráfico' };
      mockCreativeAreaRepository.findOne.mockResolvedValue(mockArea);

      const result = await service.findByArea('Diseño Gráfico');
      expect(result).toEqual(mockArea);
    });

    it('should throw NotFoundException if not found', async () => {
      mockCreativeAreaRepository.findOne.mockResolvedValue(null);
      await expect(service.findByArea('Inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a creative area successfully', async () => {
      const updateDto = { area: 'Updated Area' };
      const mockArea = { id: 1, area: 'Old Area' };
      mockCreativeAreaRepository.findOne.mockResolvedValueOnce(mockArea);
      mockCreativeAreaRepository.findOne.mockResolvedValueOnce(null);
      mockCreativeAreaRepository.update.mockResolvedValue({ affected: 1 });
      mockCreativeAreaRepository.findOne.mockResolvedValue({ ...mockArea, ...updateDto });

      const result = await service.update(1, updateDto);
      expect(result.area).toBe('Updated Area');
    });

    it('should throw NotFoundException if area not found', async () => {
      mockCreativeAreaRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      const updateDto = { area: 'Existing Area' };
      const mockArea = { id: 1, area: 'Old Area' };
      mockCreativeAreaRepository.findOne.mockResolvedValueOnce(mockArea);
      mockCreativeAreaRepository.findOne.mockResolvedValueOnce({ id: 2, area: 'Existing Area' });

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a creative area successfully', async () => {
      const mockArea = { id: 1, area: 'Diseño Gráfico', profiles: [] };
      mockCreativeAreaRepository.findOne.mockResolvedValue(mockArea);
      mockCreativeAreaRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException if area not found', async () => {
      mockCreativeAreaRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if area has associated profiles', async () => {
      const mockArea = { id: 1, area: 'Diseño Gráfico', profiles: [{ id: 1 }] };
      mockCreativeAreaRepository.findOne.mockResolvedValue(mockArea);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});