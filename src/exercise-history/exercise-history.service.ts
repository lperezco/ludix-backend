import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { ExerciseHistory } from './entities/exercise-history.entity';
import { CreateExerciseHistoryDto } from './dto/create-exercise-history.dto';
import { UpdateExerciseHistoryDto } from './dto/update-exercise-history.dto';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Injectable()
export class ExerciseHistoryService {
  constructor(
    @InjectRepository(ExerciseHistory)
    private exerciseHistoryRepository: Repository<ExerciseHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async create(createExerciseHistoryDto: CreateExerciseHistoryDto): Promise<ExerciseHistory> {
    const { userId, exerciseId, completedAt } = createExerciseHistoryDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${exerciseId} no encontrado`);
    }

    const history = this.exerciseHistoryRepository.create({ userId, exerciseId, completedAt });
    return await this.exerciseHistoryRepository.save(history);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: number,
    exerciseId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    data: ExerciseHistory[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = {};
    if (userId) where.userId = userId;
    if (exerciseId) where.exerciseId = exerciseId;
    if (startDate && endDate) where.completedAt = Between(startDate, endDate);
    else if (startDate) where.completedAt = MoreThan(startDate);
    else if (endDate) where.completedAt = LessThan(endDate);

    const [data, total] = await this.exerciseHistoryRepository.findAndCount({
      where,
      relations: ['user', 'exercise', 'exercise.exerciseType'],
      order: { completedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<ExerciseHistory> {
    const history = await this.exerciseHistoryRepository.findOne({
      where: { id },
      relations: ['user', 'exercise', 'exercise.exerciseType'],
    });
    if (!history) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }
    return history;
  }

  async findByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return this.findAll(page, limit, userId, undefined, startDate, endDate);
  }

  async findByExercise(
    exerciseId: number,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${exerciseId} no encontrado`);
    }
    return this.findAll(page, limit, undefined, exerciseId, startDate, endDate);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
    userId?: number,
  ): Promise<any> {
    return this.findAll(page, limit, userId, undefined, startDate, endDate);
  }

  async getTodayHistory(userId: number): Promise<ExerciseHistory[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.exerciseHistoryRepository.find({
      where: { userId, completedAt: Between(today, tomorrow) },
      relations: ['exercise', 'exercise.exerciseType'],
      order: { completedAt: 'DESC' },
    });
  }

  async getCurrentWeekHistory(userId: number): Promise<ExerciseHistory[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return await this.exerciseHistoryRepository.find({
      where: { userId, completedAt: Between(startOfWeek, endOfWeek) },
      relations: ['exercise', 'exercise.exerciseType'],
      order: { completedAt: 'ASC' },
    });
  }

  async getCurrentStreak(userId: number): Promise<number> {
    const history = await this.exerciseHistoryRepository.find({
      where: { userId },
      order: { completedAt: 'DESC' },
    });
    if (history.length === 0) return 0;

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const uniqueDates = [...new Set(history.map((h) => new Date(h.completedAt).toDateString()))];

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);
      if (date.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /**
   * Estadísticas de un usuario (versión robusta, nunca lanza 500)
   */
  async getUserStats(userId: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          userId,
          message: 'Usuario no encontrado',
          totalCompletions: 0,
          currentStreak: 0,
          topExercises: [],
          byExerciseType: [],
          last30Days: [],
        };
      }

      const totalCompletions = await this.exerciseHistoryRepository.count({ where: { userId } });

      let topExercises: any[] = [];
      try {
        topExercises = await this.exerciseHistoryRepository
          .createQueryBuilder('history')
          .leftJoin('history.exercise', 'exercise')
          .select('exercise.id', 'exerciseId')
          .addSelect('exercise.name', 'exerciseName')
          .addSelect('COUNT(history.id)', 'completionCount')
          .where('history.userId = :userId', { userId })
          .groupBy('exercise.id')
          .addGroupBy('exercise.name')
          .orderBy('completionCount', 'DESC')
          .limit(5)
          .getRawMany();
      } catch (err) {
        console.warn(`Error en topExercises para userId ${userId}:`, err.message);
      }

      let byExerciseType: any[] = [];
      try {
        byExerciseType = await this.exerciseHistoryRepository
          .createQueryBuilder('history')
          .leftJoin('history.exercise', 'exercise')
          .leftJoin('exercise.exerciseType', 'exerciseType')
          .select('exerciseType.id', 'typeId')
          .addSelect('exerciseType.type', 'typeName')
          .addSelect('COUNT(history.id)', 'count')
          .where('history.userId = :userId', { userId })
          .groupBy('exerciseType.id')
          .addGroupBy('exerciseType.type')
          .getRawMany();
      } catch (err) {
        console.warn(`Error en byExerciseType para userId ${userId}:`, err.message);
      }

      let byDay: any[] = [];
      try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        byDay = await this.exerciseHistoryRepository
          .createQueryBuilder('history')
          .select('DATE(history.completedAt)', 'date')
          .addSelect('COUNT(*)', 'count')
          .where('history.userId = :userId', { userId })
          .andWhere('history.completedAt > :last30Days', { last30Days })
          .groupBy('DATE(history.completedAt)')
          .orderBy('date', 'ASC')
          .getRawMany();
      } catch (err) {
        console.warn(`Error en byDay para userId ${userId}:`, err.message);
      }

      let streak = 0;
      try {
        streak = await this.getCurrentStreak(userId);
      } catch (err) {
        console.warn(`Error en getCurrentStreak para userId ${userId}:`, err.message);
      }

      return {
        userId,
        userName: user.name,
        totalCompletions,
        currentStreak: streak,
        topExercises,
        byExerciseType,
        last30Days: byDay,
      };
    } catch (error) {
      console.error(`Error grave en getUserStats para userId ${userId}:`, error);
      return {
        userId,
        message: 'Estadísticas no disponibles temporalmente',
        totalCompletions: 0,
        currentStreak: 0,
        topExercises: [],
        byExerciseType: [],
        last30Days: [],
      };
    }
  }

  /**
   * Estadísticas globales (versión robusta, nunca lanza 500)
   */
  async getGlobalStats(): Promise<any> {
    try {
      const totalCompletions = await this.exerciseHistoryRepository.count();

      let activeUsers = 0;
      try {
        const activeUsersRaw = await this.exerciseHistoryRepository
          .createQueryBuilder('history')
          .select('COUNT(DISTINCT history.userId)', 'count')
          .getRawOne();
        activeUsers = activeUsersRaw?.count ?? 0;
      } catch (err) {
        console.warn('Error al contar usuarios activos:', err.message);
      }

      let mostCompletedExercise: any = null;
      try {
        const result = await this.exerciseHistoryRepository
          .createQueryBuilder('history')
          .leftJoin('history.exercise', 'exercise')
          .select('exercise.id', 'exerciseId')
          .addSelect('exercise.name', 'exerciseName')
          .addSelect('COUNT(history.id)', 'completionCount')
          .groupBy('exercise.id')
          .addGroupBy('exercise.name')
          .orderBy('completionCount', 'DESC')
          .limit(1)
          .getRawOne();
        mostCompletedExercise = result ?? null;
      } catch (err) {
        console.warn('Error al obtener ejercicio más completado:', err.message);
      }

      let byDay: any[] = [];
      try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        byDay = await this.exerciseHistoryRepository
          .createQueryBuilder('history')
          .select('DATE(history.completedAt)', 'date')
          .addSelect('COUNT(*)', 'count')
          .where('history.completedAt > :last30Days', { last30Days })
          .groupBy('DATE(history.completedAt)')
          .orderBy('date', 'ASC')
          .getRawMany();
      } catch (err) {
        console.warn('Error al obtener completados por día:', err.message);
      }

      return {
        totalCompletions,
        activeUsers,
        mostCompletedExercise,
        last30Days: byDay,
      };
    } catch (error) {
      console.error('Error grave en getGlobalStats:', error);
      return {
        totalCompletions: 0,
        activeUsers: 0,
        mostCompletedExercise: null,
        last30Days: [],
        message: 'Estadísticas no disponibles temporalmente',
      };
    }
  }

  async update(id: number, updateExerciseHistoryDto: UpdateExerciseHistoryDto): Promise<ExerciseHistory> {
    const history = await this.findById(id);

    if (updateExerciseHistoryDto.userId && updateExerciseHistoryDto.userId !== history.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateExerciseHistoryDto.userId } });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateExerciseHistoryDto.userId} no encontrado`);
      }
    }

    if (updateExerciseHistoryDto.exerciseId && updateExerciseHistoryDto.exerciseId !== history.exerciseId) {
      const exercise = await this.exerciseRepository.findOne({ where: { id: updateExerciseHistoryDto.exerciseId } });
      if (!exercise) {
        throw new NotFoundException(`Ejercicio con ID ${updateExerciseHistoryDto.exerciseId} no encontrado`);
      }
    }

    await this.exerciseHistoryRepository.update(id, updateExerciseHistoryDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const history = await this.findById(id);
    const result = await this.exerciseHistoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }
    return {
      message: `Ejercicio ${history.exercise?.name || history.exerciseId} completado por ${history.user?.name || history.userId} el ${new Date(history.completedAt).toLocaleDateString('es-ES')} eliminado correctamente`,
    };
  }

  async removeByUser(userId: number): Promise<{ message: string }> {
    const historyCount = await this.exerciseHistoryRepository.count({ where: { userId } });
    if (historyCount === 0) {
      throw new NotFoundException(`El usuario ${userId} no tiene historial`);
    }
    const result = await this.exerciseHistoryRepository.delete({ userId });
    return {
      message: `Se eliminaron ${result.affected} registros del historial del usuario ${userId}`,
    };
  }
}
