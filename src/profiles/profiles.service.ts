import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';
import { CreativeArea } from '../creative-areas/entities/creative-area.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CreativeArea)
    private creativeAreaRepository: Repository<CreativeArea>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const { userId, creativeAreaId, bio, avatarUrl, location, socialLinks } = createProfileDto;

    // Verificar usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar si ya tiene perfil
    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (existingProfile) {
      throw new ConflictException(`El usuario ${userId} ya tiene un perfil`);
    }

    // Verificar área creativa
    const creativeArea = await this.creativeAreaRepository.findOne({
      where: { id: creativeAreaId },
    });
    if (!creativeArea) {
      throw new NotFoundException(`Área creativa con ID ${creativeAreaId} no encontrada`);
    }

    const profile = this.profileRepository.create({
      userId,
      creativeAreaId,
      bio,
      avatarUrl,
      location,
      socialLinks,
    });

    return await this.profileRepository.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    // No cargues relaciones problemáticas, solo ordena
    return await this.profileRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      // Sin relaciones para evitar errores
    });
    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }
    return profile;
  }

  async findByUserId(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException(`Perfil para usuario con ID ${userId} no encontrado`);
    }
    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findById(id);

    if (updateProfileDto.userId && updateProfileDto.userId !== profile.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateProfileDto.userId },
      });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateProfileDto.userId} no encontrado`);
      }

      const existingProfile = await this.profileRepository.findOne({
        where: { userId: updateProfileDto.userId },
      });
      if (existingProfile && existingProfile.id !== id) {
        throw new ConflictException(`El usuario ${updateProfileDto.userId} ya tiene un perfil`);
      }
    }

    if (updateProfileDto.creativeAreaId && updateProfileDto.creativeAreaId !== profile.creativeAreaId) {
      const creativeArea = await this.creativeAreaRepository.findOne({
        where: { id: updateProfileDto.creativeAreaId },
      });
      if (!creativeArea) {
        throw new NotFoundException(`Área creativa con ID ${updateProfileDto.creativeAreaId} no encontrada`);
      }
    }

    await this.profileRepository.update(id, updateProfileDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const profile = await this.findById(id);
    await this.profileRepository.delete(id);
    return {
      message: `Perfil de usuario ${profile.userId} eliminado correctamente`,
    };
  }
}
