import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseType } from './entities/exercise-type.entity';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';

@Injectable()
export class ExerciseTypesService {
  constructor(
    @InjectRepository(ExerciseType)
    private exerciseTypeRepository: Repository<ExerciseType>,
  ) {}

  async create(
    createExerciseTypeDto: CreateExerciseTypeDto,
  ): Promise<ExerciseType> {
    const { type } = createExerciseTypeDto;

    const existing = await this.exerciseTypeRepository.findOne({
      where: { type },
    });
    if (existing) {
      throw new ConflictException(`El tipo de ejercicio "${type}" ya existe`);
    }

    const exerciseType = this.exerciseTypeRepository.create(
      createExerciseTypeDto,
    );
    return await this.exerciseTypeRepository.save(exerciseType);
  }

  async findAll(): Promise<ExerciseType[]> {
    return await this.exerciseTypeRepository.find({
      relations: ['exercises', 'challenges'],
      order: { type: 'ASC' },
    });
  }

  async findById(id: number): Promise<ExerciseType> {
    const exerciseType = await this.exerciseTypeRepository.findOne({
      where: { id },
      relations: ['exercises', 'challenges'],
    });
    if (!exerciseType) {
      throw new NotFoundException(
        `Tipo de ejercicio con ID ${id} no encontrado`,
      );
    }
    return exerciseType;
  }

  async findByType(type: string): Promise<ExerciseType> {
    const exerciseType = await this.exerciseTypeRepository.findOne({
      where: { type },
    });
    if (!exerciseType) {
      throw new NotFoundException(`Tipo de ejercicio "${type}" no encontrado`);
    }
    return exerciseType;
  }

  async update(
    id: number,
    updateExerciseTypeDto: UpdateExerciseTypeDto,
  ): Promise<ExerciseType> {
    const exerciseType = await this.findById(id);

    if (
      updateExerciseTypeDto.type &&
      updateExerciseTypeDto.type !== exerciseType.type
    ) {
      const existing = await this.exerciseTypeRepository.findOne({
        where: { type: updateExerciseTypeDto.type },
      });
      if (existing) {
        throw new ConflictException(
          `El tipo de ejercicio "${updateExerciseTypeDto.type}" ya existe`,
        );
      }
    }

    await this.exerciseTypeRepository.update(id, updateExerciseTypeDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const exerciseType = await this.findById(id);

    if (exerciseType.exercises && exerciseType.exercises.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el tipo "${exerciseType.type}" porque tiene ${exerciseType.exercises.length} ejercicios asociados`,
      );
    }

    await this.exerciseTypeRepository.delete(id);
    return {
      message: `Tipo de ejercicio "${exerciseType.type}" eliminado correctamente`,
    };
  }
}
