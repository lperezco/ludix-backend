import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreativeArea } from './entities/creative-area.entity';
import { CreateCreativeAreaDto } from './dto/create-creative-area.dto';
import { UpdateCreativeAreaDto } from './dto/update-creative-area.dto';
import { Profile } from '../profiles/entities/profile.entity';

@Injectable()
export class CreativeAreasService {
  constructor(
    @InjectRepository(CreativeArea)
    private creativeAreaRepository: Repository<CreativeArea>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async create(createCreativeAreaDto: CreateCreativeAreaDto): Promise<CreativeArea> {
    const { area } = createCreativeAreaDto;

    const existing = await this.creativeAreaRepository.findOne({
      where: { area },
    });
    if (existing) {
      throw new ConflictException(`El área creativa "${area}" ya existe`);
    }

    const creativeArea = this.creativeAreaRepository.create(createCreativeAreaDto);
    return await this.creativeAreaRepository.save(creativeArea);
  }

  async findAll(): Promise<CreativeArea[]> {
    return await this.creativeAreaRepository.find({
      relations: ['profiles'],
      order: { area: 'ASC' },
    });
  }

  async findById(id: number): Promise<CreativeArea> {
    const creativeArea = await this.creativeAreaRepository.findOne({
      where: { id },
      relations: ['profiles', 'profiles.user'],
    });
    if (!creativeArea) {
      throw new NotFoundException(`Área creativa con ID ${id} no encontrada`);
    }
    return creativeArea;
  }

  async findByArea(area: string): Promise<CreativeArea> {
    const creativeArea = await this.creativeAreaRepository.findOne({
      where: { area },
    });
    if (!creativeArea) {
      throw new NotFoundException(`Área creativa "${area}" no encontrada`);
    }
    return creativeArea;
  }

  async update(id: number, updateCreativeAreaDto: UpdateCreativeAreaDto): Promise<CreativeArea> {
    const creativeArea = await this.findById(id);

    if (updateCreativeAreaDto.area && updateCreativeAreaDto.area !== creativeArea.area) {
      const existing = await this.creativeAreaRepository.findOne({
        where: { area: updateCreativeAreaDto.area },
      });
      if (existing) {
        throw new ConflictException(`El área creativa "${updateCreativeAreaDto.area}" ya existe`);
      }
    }

    await this.creativeAreaRepository.update(id, updateCreativeAreaDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const creativeArea = await this.findById(id);

    if (creativeArea.profiles && creativeArea.profiles.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el área "${creativeArea.area}" porque tiene ${creativeArea.profiles.length} perfiles asociados`,
      );
    }

    await this.creativeAreaRepository.delete(id);
    return {
      message: `Área creativa "${creativeArea.area}" eliminada correctamente`,
    };
  }
}