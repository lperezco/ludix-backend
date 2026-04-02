import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { ExerciseHistory } from '../exercise-history/entities/exercise-history.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(ExerciseType)
    private exerciseTypeRepository: Repository<ExerciseType>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(ExerciseHistory)
    private exerciseHistoryRepository: Repository<ExerciseHistory>,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const { name, exerciseTypeId, createdBy } = createExerciseDto;

    const existing = await this.exerciseRepository.findOne({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un ejercicio con el nombre "${name}"`);
    }

    const exerciseType = await this.exerciseTypeRepository.findOne({
      where: { id: exerciseTypeId },
    });
    if (!exerciseType) {
      throw new NotFoundException(`Tipo de ejercicio con ID ${exerciseTypeId} no encontrado`);
    }

    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      createdBy: createdBy || 'system',
    });

    return await this.exerciseRepository.save(exercise);
  }

  async findAll(): Promise<Exercise[]> {
    return await this.exerciseRepository.find({
      relations: ['exerciseType', 'favorites', 'histories'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: ['exerciseType', 'favorites', 'histories'],
    });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${id} no encontrado`);
    }
    return exercise;
  }

  async findByType(exerciseTypeId: number): Promise<Exercise[]> {
    const exerciseType = await this.exerciseTypeRepository.findOne({
      where: { id: exerciseTypeId },
    });
    if (!exerciseType) {
      throw new NotFoundException(`Tipo de ejercicio con ID ${exerciseTypeId} no encontrado`);
    }

    return await this.exerciseRepository.find({
      where: { exerciseTypeId },
      relations: ['exerciseType'],
      order: { name: 'ASC' },
    });
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
    const exercise = await this.findById(id);

    if (updateExerciseDto.name && updateExerciseDto.name !== exercise.name) {
      const existing = await this.exerciseRepository.findOne({
        where: { name: updateExerciseDto.name },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un ejercicio con el nombre "${updateExerciseDto.name}"`);
      }
    }

    if (updateExerciseDto.exerciseTypeId && updateExerciseDto.exerciseTypeId !== exercise.exerciseTypeId) {
      const exerciseType = await this.exerciseTypeRepository.findOne({
        where: { id: updateExerciseDto.exerciseTypeId },
      });
      if (!exerciseType) {
        throw new NotFoundException(`Tipo de ejercicio con ID ${updateExerciseDto.exerciseTypeId} no encontrado`);
      }
    }

    await this.exerciseRepository.update(id, updateExerciseDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const exercise = await this.findById(id);

    const favoritesCount = await this.favoriteRepository.count({
      where: { exerciseId: id },
    });
    const historyCount = await this.exerciseHistoryRepository.count({
      where: { exerciseId: id },
    });

    if (favoritesCount > 0) {
      await this.favoriteRepository.delete({ exerciseId: id });
    }
    if (historyCount > 0) {
      await this.exerciseHistoryRepository.delete({ exerciseId: id });
    }

    await this.exerciseRepository.delete(id);
    return {
      message: `Ejercicio "${exercise.name}" eliminado correctamente. Se eliminaron ${favoritesCount} favoritos y ${historyCount} registros de historial.`,
    };
  }
}