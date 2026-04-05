import {
  Injectable,
  NotFoundException,
  ConflictException,
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

  async create(createDto: CreateUserAchievementDto): Promise<UserAchievement> {
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.userId} no encontrado`,
      );
    }

    const achievement = await this.achievementRepository.findOne({
      where: { id: createDto.achievementId },
    });
    if (!achievement) {
      throw new NotFoundException(
        `Logro con ID ${createDto.achievementId} no encontrado`,
      );
    }

    const existing = await this.userAchievementRepository.findOne({
      where: {
        userId: createDto.userId,
        achievementId: createDto.achievementId,
      },
    });
    if (existing) {
      throw new ConflictException('El usuario ya tiene este logro');
    }

    const entity = this.userAchievementRepository.create(createDto);
    return this.userAchievementRepository.save(entity);
  }

  async findAll(): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      relations: ['user', 'achievement'],
    });
  }

  async findById(id: number): Promise<UserAchievement> {
    const entity = await this.userAchievementRepository.findOne({
      where: { id },
      relations: ['user', 'achievement'],
    });
    if (!entity) {
      throw new NotFoundException(
        `Relación usuario-logro con ID ${id} no encontrada`,
      );
    }
    return entity;
  }

  async findByUser(userId: number): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
    });
  }

  async findByAchievement(achievementId: number): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      where: { achievementId },
      relations: ['user'],
    });
  }

  async hasAchievement(
    userId: number,
    achievementId: number,
  ): Promise<boolean> {
    const count = await this.userAchievementRepository.count({
      where: { userId, achievementId },
    });
    return count > 0;
  }

  async update(
    id: number,
    updateDto: UpdateUserAchievementDto,
  ): Promise<UserAchievement> {
    await this.findById(id);
    await this.userAchievementRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findById(id);
    await this.userAchievementRepository.delete(id);
    return { message: 'Logro eliminado del usuario correctamente' };
  }

  async removeAllByUser(userId: number): Promise<{ message: string }> {
    const result = await this.userAchievementRepository.delete({ userId });
    return { message: `Se eliminaron ${result.affected} logros del usuario` };
  }
}
