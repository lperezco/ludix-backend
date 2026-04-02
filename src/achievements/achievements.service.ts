import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { UserAchievement } from '../user-achievements/entities/user-achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
  ) {}

  async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
    const { name } = createAchievementDto;

    const existing = await this.achievementRepository.findOne({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(`El logro "${name}" ya existe`);
    }

    const achievement = this.achievementRepository.create(createAchievementDto);
    return await this.achievementRepository.save(achievement);
  }

  async findAll(): Promise<Achievement[]> {
    return await this.achievementRepository.find({
      relations: ['userAchievements'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Achievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id },
      relations: ['userAchievements', 'userAchievements.user'],
    });
    if (!achievement) {
      throw new NotFoundException(`Logro con ID ${id} no encontrado`);
    }
    return achievement;
  }

  async findByName(name: string): Promise<Achievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { name },
    });
    if (!achievement) {
      throw new NotFoundException(`Logro "${name}" no encontrado`);
    }
    return achievement;
  }

  async update(id: number, updateAchievementDto: UpdateAchievementDto): Promise<Achievement> {
    const achievement = await this.findById(id);

    if (updateAchievementDto.name && updateAchievementDto.name !== achievement.name) {
      const existing = await this.achievementRepository.findOne({
        where: { name: updateAchievementDto.name },
      });
      if (existing) {
        throw new ConflictException(`El logro "${updateAchievementDto.name}" ya existe`);
      }
    }

    await this.achievementRepository.update(id, updateAchievementDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const achievement = await this.findById(id);

    const userAchievements = await this.userAchievementRepository.count({
      where: { achievementId: id },
    });

    if (userAchievements > 0) {
      throw new BadRequestException(
        `No se puede eliminar el logro "${achievement.name}" porque ${userAchievements} usuarios ya lo han obtenido`,
      );
    }

    await this.achievementRepository.delete(id);
    return {
      message: `Logro "${achievement.name}" eliminado correctamente`,
    };
  }
}