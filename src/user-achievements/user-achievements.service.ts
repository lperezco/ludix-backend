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
    const { userId, achievementId, dateOfAchievement } = createDto;

    // Verificar usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar logro
    const achievement = await this.achievementRepository.findOne({ where: { id: achievementId } });
    if (!achievement) {
      throw new NotFoundException(`Logro con ID ${achievementId} no encontrado`);
    }

    // Verificar duplicado
    const existing = await this.userAchievementRepository.findOne({
      where: { userId, achievementId },
    });
    if (existing) {
      throw new ConflictException('El usuario ya tiene este logro');
    }

    const entity = this.userAchievementRepository.create({
      userId,
      achievementId,
      dateOfAchievement,
    });
    return this.userAchievementRepository.save(entity);
  }

  async findAll(): Promise<UserAchievement[]> {
    // Sin relaciones para evitar errores
    return this.userAchievementRepository.find();
  }

  async findById(id: number): Promise<UserAchievement> {
    const entity = await this.userAchievementRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Relación usuario-logro con ID ${id} no encontrada`);
    }
    return entity;
  }

  async findByUser(userId: number): Promise<UserAchievement[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return this.userAchievementRepository.find({ where: { userId } });
  }

  async findByAchievement(achievementId: number): Promise<UserAchievement[]> {
    // Verificar que el logro existe
    const achievement = await this.achievementRepository.findOne({ where: { id: achievementId } });
    if (!achievement) {
      throw new NotFoundException(`Logro con ID ${achievementId} no encontrado`);
    }
    return this.userAchievementRepository.find({ where: { achievementId } });
  }

  async hasAchievement(userId: number, achievementId: number): Promise<boolean> {
    const count = await this.userAchievementRepository.count({
      where: { userId, achievementId },
    });
    return count > 0;
  }

  async update(id: number, updateDto: UpdateUserAchievementDto): Promise<UserAchievement> {
    // Verificar que la relación existe
    await this.findById(id);
    // Solo se puede actualizar la fecha (no se permite cambiar userId o achievementId)
    await this.userAchievementRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findById(id);
    await this.userAchievementRepository.delete(id);
    return { message: 'Logro eliminado del usuario correctamente' };
  }

  async removeAllByUser(userId: number): Promise<{ message: string }> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    const result = await this.userAchievementRepository.delete({ userId });
    return { message: `Se eliminaron ${result.affected} logros del usuario ${userId}` };
  }
}
