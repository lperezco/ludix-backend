import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAchievement } from './entities/user-achievement.entity';
import { CreateUserAchievementDto } from './dto/create-user-achievement.dto';
import { UpdateUserAchievementDto } from './dto/update-user-achievement.dto';
import { User } from '../users/entities/user.entity';
import { Achievement } from '../achievements/entities/achievement.entity';

@Injectable()
export class UserAchievementsService {
  constructor(
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  /**
   * Crear una nueva relación usuario-logro
   */
  async create(createUserAchievementDto: CreateUserAchievementDto): Promise<UserAchievement> {
    const { userId, achievementId, dateOfAchievement } = createUserAchievementDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que el logro existe
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });
    if (!achievement) {
      throw new NotFoundException(`Logro con ID ${achievementId} no encontrado`);
    }

    // Verificar que el usuario no tenga ya este logro
    const existingUserAchievement = await this.userAchievementRepository.findOne({
      where: {
        userId,
        achievementId,
      },
    });

    if (existingUserAchievement) {
      throw new ConflictException(
        `El usuario ${userId} ya tiene el logro ${achievementId} (fecha: ${existingUserAchievement.dateOfAchievement})`,
      );
    }

    // Crear la relación
    const userAchievement = this.userAchievementRepository.create({
      userId,
      achievementId,
      dateOfAchievement,
    });

    return await this.userAchievementRepository.save(userAchievement);
  }

  /**
   * Obtener todas las relaciones usuario-logro
   */
  async findAll(): Promise<UserAchievement[]> {
    return await this.userAchievementRepository.find({
      relations: ['user', 'achievement'],
      order: { dateOfAchievement: 'DESC' },
    });
  }

  /**
   * Obtener una relación por ID
   */
  async findById(id: number): Promise<UserAchievement> {
    const userAchievement = await this.userAchievementRepository.findOne({
      where: { id },
      relations: ['user', 'achievement'],
    });

    if (!userAchievement) {
      throw new NotFoundException(`Relación usuario-logro con ID ${id} no encontrada`);
    }

    return userAchievement;
  }

  /**
   * Obtener todos los logros de un usuario
   */
  async findByUser(userId: number): Promise<UserAchievement[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return await this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
      order: { dateOfAchievement: 'DESC' },
    });
  }

  /**
   * Obtener todos los usuarios que tienen un logro específico
   */
  async findByAchievement(achievementId: number): Promise<UserAchievement[]> {
    // Verificar que el logro existe
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });
    if (!achievement) {
      throw new NotFoundException(`Logro con ID ${achievementId} no encontrado`);
    }

    return await this.userAchievementRepository.find({
      where: { achievementId },
      relations: ['user'],
      order: { dateOfAchievement: 'DESC' },
    });
  }

  /**
   * Verificar si un usuario tiene un logro específico
   */
  async hasAchievement(userId: number, achievementId: number): Promise<boolean> {
    const userAchievement = await this.userAchievementRepository.findOne({
      where: { userId, achievementId },
    });
    return !!userAchievement;
  }

  /**
   * Actualizar una relación usuario-logro
   */
  async update(id: number, updateUserAchievementDto: UpdateUserAchievementDto): Promise<UserAchievement> {
    // Verificar que la relación existe
    const userAchievement = await this.findById(id);

    // Si se actualiza el userId, verificar que el nuevo usuario existe
    if (updateUserAchievementDto.userId && updateUserAchievementDto.userId !== userAchievement.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateUserAchievementDto.userId },
      });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateUserAchievementDto.userId} no encontrado`);
      }

      // Verificar que no exista ya esa combinación
      const existingCombination = await this.userAchievementRepository.findOne({
        where: {
          userId: updateUserAchievementDto.userId,
          achievementId: updateUserAchievementDto.achievementId || userAchievement.achievementId,
        },
      });
      if (existingCombination && existingCombination.id !== id) {
        throw new ConflictException(
          `El usuario ${updateUserAchievementDto.userId} ya tiene el logro ${updateUserAchievementDto.achievementId || userAchievement.achievementId}`,
        );
      }
    }

    // Si se actualiza el achievementId, verificar que el nuevo logro existe
    if (updateUserAchievementDto.achievementId && updateUserAchievementDto.achievementId !== userAchievement.achievementId) {
      const achievement = await this.achievementRepository.findOne({
        where: { id: updateUserAchievementDto.achievementId },
      });
      if (!achievement) {
        throw new NotFoundException(`Logro con ID ${updateUserAchievementDto.achievementId} no encontrado`);
      }

      // Verificar que no exista ya esa combinación
      const existingCombination = await this.userAchievementRepository.findOne({
        where: {
          userId: updateUserAchievementDto.userId || userAchievement.userId,
          achievementId: updateUserAchievementDto.achievementId,
        },
      });
      if (existingCombination && existingCombination.id !== id) {
        throw new ConflictException(
          `El usuario ${updateUserAchievementDto.userId || userAchievement.userId} ya tiene el logro ${updateUserAchievementDto.achievementId}`,
        );
      }
    }

    // Actualizar
    await this.userAchievementRepository.update(id, updateUserAchievementDto);
    
    return this.findById(id);
  }

  /**
   * Eliminar una relación usuario-logro
   */
  async remove(id: number): Promise<{ message: string }> {
    const userAchievement = await this.findById(id);
    
    const result = await this.userAchievementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Relación usuario-logro con ID ${id} no encontrada`);
    }
    
    return {
      message: `Logro '${userAchievement.achievement?.name || userAchievement.achievementId}' eliminado del usuario '${userAchievement.user?.name || userAchievement.userId}' correctamente`,
    };
  }

  /**
   * Eliminar todos los logros de un usuario
   */
  async removeAllByUser(userId: number): Promise<{ message: string }> {
    const userAchievements = await this.findByUser(userId);
    
    if (userAchievements.length === 0) {
      throw new NotFoundException(`El usuario ${userId} no tiene logros asignados`);
    }
    
    const result = await this.userAchievementRepository.delete({ userId });
    
    return {
      message: `Se eliminaron ${result.affected} logros del usuario ${userId}`,
    };
  }
}