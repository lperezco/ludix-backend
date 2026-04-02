import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Challenge } from './entities/challenge.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(ExerciseType)
    private exerciseTypeRepository: Repository<ExerciseType>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const { title, exerciseTypeId, startDate, endDate } = createChallengeDto;

    const existing = await this.challengeRepository.findOne({
      where: { title },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un reto con el título "${title}"`);
    }

    const exerciseType = await this.exerciseTypeRepository.findOne({
      where: { id: exerciseTypeId },
    });
    if (!exerciseType) {
      throw new NotFoundException(`Tipo de ejercicio con ID ${exerciseTypeId} no encontrado`);
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const challenge = this.challengeRepository.create(createChallengeDto);
    return await this.challengeRepository.save(challenge);
  }

  async findAll(): Promise<Challenge[]> {
    return await this.challengeRepository.find({
      relations: ['exerciseType', 'posts'],
      order: { startDate: 'DESC' },
    });
  }

  async findById(id: number): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id },
      relations: ['exerciseType', 'posts', 'posts.profile', 'posts.profile.user'],
    });
    if (!challenge) {
      throw new NotFoundException(`Reto con ID ${id} no encontrado`);
    }
    return challenge;
  }

  async findByType(exerciseTypeId: number): Promise<Challenge[]> {
    const exerciseType = await this.exerciseTypeRepository.findOne({
      where: { id: exerciseTypeId },
    });
    if (!exerciseType) {
      throw new NotFoundException(`Tipo de ejercicio con ID ${exerciseTypeId} no encontrado`);
    }

    return await this.challengeRepository.find({
      where: { exerciseTypeId },
      relations: ['exerciseType'],
      order: { startDate: 'DESC' },
    });
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.challengeRepository.find({
      where: {
        startDate: LessThan(today),
        endDate: MoreThan(today),
      },
      relations: ['exerciseType'],
      order: { startDate: 'ASC' },
    });
  }

  async getCurrentChallenge(): Promise<Challenge | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.challengeRepository.findOne({
      where: {
        startDate: LessThan(today),
        endDate: MoreThan(today),
      },
      relations: ['exerciseType', 'posts'],
      order: { startDate: 'DESC' },
    });
  }

  async update(id: number, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
    const challenge = await this.findById(id);

    if (updateChallengeDto.title && updateChallengeDto.title !== challenge.title) {
      const existing = await this.challengeRepository.findOne({
        where: { title: updateChallengeDto.title },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un reto con el título "${updateChallengeDto.title}"`);
      }
    }

    if (updateChallengeDto.exerciseTypeId && updateChallengeDto.exerciseTypeId !== challenge.exerciseTypeId) {
      const exerciseType = await this.exerciseTypeRepository.findOne({
        where: { id: updateChallengeDto.exerciseTypeId },
      });
      if (!exerciseType) {
        throw new NotFoundException(`Tipo de ejercicio con ID ${updateChallengeDto.exerciseTypeId} no encontrado`);
      }
    }

    const startDate = updateChallengeDto.startDate || challenge.startDate;
    const endDate = updateChallengeDto.endDate || challenge.endDate;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    await this.challengeRepository.update(id, updateChallengeDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const challenge = await this.findById(id);

    const postsCount = await this.postRepository.count({
      where: { challengeId: id },
    });

    if (postsCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el reto "${challenge.title}" porque tiene ${postsCount} posts asociados`,
      );
    }

    await this.challengeRepository.delete(id);
    return {
      message: `Reto "${challenge.title}" eliminado correctamente`,
    };
  }
}