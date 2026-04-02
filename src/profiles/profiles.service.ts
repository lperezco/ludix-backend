import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
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

  /**
   * Crear un nuevo perfil
   */
  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const { userId, creativeAreaId, bio, avatarUrl, location, socialLinks } = createProfileDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que el usuario no tenga ya un perfil
    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (existingProfile) {
      throw new ConflictException(
        `El usuario ${userId} ya tiene un perfil. No se pueden crear perfiles duplicados.`,
      );
    }

    // Verificar que el área creativa existe
    const creativeArea = await this.creativeAreaRepository.findOne({
      where: { id: creativeAreaId },
    });
    if (!creativeArea) {
      throw new NotFoundException(`Área creativa con ID ${creativeAreaId} no encontrada`);
    }

    // Crear el perfil
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

  /**
   * Obtener todos los perfiles
   */
  async findAll(): Promise<Profile[]> {
    return await this.profileRepository.find({
      relations: ['user', 'creativeArea', 'posts'],
      order: { id: 'ASC' },
    });
  }

  /**
   * Obtener un perfil por ID
   */
  async findById(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user', 'creativeArea', 'posts'],
    });

    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return profile;
  }

  /**
   * Obtener perfil por userId
   */
  async findByUserId(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user', 'creativeArea', 'posts'],
    });

    if (!profile) {
      throw new NotFoundException(`Perfil para usuario con ID ${userId} no encontrado`);
    }

    return profile;
  }

  /**
   * Obtener perfiles por área creativa
   */
  async findByCreativeArea(creativeAreaId: number): Promise<Profile[]> {
    // Verificar que el área creativa existe
    const creativeArea = await this.creativeAreaRepository.findOne({
      where: { id: creativeAreaId },
    });
    if (!creativeArea) {
      throw new NotFoundException(`Área creativa con ID ${creativeAreaId} no encontrada`);
    }

    return await this.profileRepository.find({
      where: { creativeAreaId },
      relations: ['user'],
      order: { id: 'ASC' },
    });
  }

  /**
   * Actualizar un perfil
   */
  async update(id: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findById(id);

    // Si se actualiza el userId, verificar que el nuevo usuario existe y no tiene perfil
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
        throw new ConflictException(
          `El usuario ${updateProfileDto.userId} ya tiene un perfil asociado`,
        );
      }
    }

    // Si se actualiza el creativeAreaId, verificar que existe
    if (updateProfileDto.creativeAreaId && updateProfileDto.creativeAreaId !== profile.creativeAreaId) {
      const creativeArea = await this.creativeAreaRepository.findOne({
        where: { id: updateProfileDto.creativeAreaId },
      });
      if (!creativeArea) {
        throw new NotFoundException(
          `Área creativa con ID ${updateProfileDto.creativeAreaId} no encontrada`,
        );
      }
    }

    // Actualizar
    await this.profileRepository.update(id, updateProfileDto);
    
    return this.findById(id);
  }

  /**
   * Actualizar perfil por userId (útil para el propio usuario)
   */
  async updateByUserId(userId: number, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    return this.update(profile.id, updateProfileDto);
  }

  /**
   * Eliminar un perfil
   */
  async remove(id: number): Promise<{ message: string }> {
    const profile = await this.findById(id);
    
    // Verificar si el perfil tiene posts
    if (profile.posts && profile.posts.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el perfil porque tiene ${profile.posts.length} posts asociados. Elimina los posts primero.`,
      );
    }
    
    const result = await this.profileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }
    
    return {
      message: `Perfil de usuario ${profile.user?.name || profile.userId} (ID: ${id}) eliminado correctamente`,
    };
  }

  /**
   * Obtener estadísticas de perfiles
   */
  async getStats(): Promise<any> {
    const total = await this.profileRepository.count();
    
    // Perfiles por área creativa
    const profilesByCreativeArea = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.creativeArea', 'creativeArea')
      .select('creativeArea.id', 'creativeAreaId')
      .addSelect('creativeArea.name', 'creativeAreaName')
      .addSelect('COUNT(profile.id)', 'count')
      .groupBy('creativeArea.id')
      .addGroupBy('creativeArea.name')
      .getRawMany();

    // Perfiles con posts
    const profilesWithPosts = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoin('profile.posts', 'post')
      .select('COUNT(DISTINCT profile.id)', 'count')
      .where('post.id IS NOT NULL')
      .getRawOne();

    // Perfiles sin posts
    const profilesWithoutPosts = total - (profilesWithPosts?.count || 0);

    return {
      total,
      profilesWithPosts: profilesWithPosts?.count || 0,
      profilesWithoutPosts,
      byCreativeArea: profilesByCreativeArea,
    };
  }

  /**
   * Buscar perfiles por término (búsqueda)
   */
  async search(searchTerm: string): Promise<Profile[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.findAll();
    }

    return await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.creativeArea', 'creativeArea')
      .where('user.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('profile.bio ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('profile.location ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('user.name', 'ASC')
      .getMany();
  }
}