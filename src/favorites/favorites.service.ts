import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const { userId, exerciseId } = createFavoriteDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${exerciseId} no encontrado`);
    }

    const existing = await this.favoriteRepository.findOne({
      where: { userId, exerciseId },
    });
    if (existing) {
      throw new ConflictException(`El ejercicio ya está en favoritos del usuario`);
    }

    const favorite = this.favoriteRepository.create({ userId, exerciseId });
    return await this.favoriteRepository.save(favorite);
  }

  async findAll(): Promise<Favorite[]> {
    return await this.favoriteRepository.find({
      relations: ['user', 'exercise', 'exercise.exerciseType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id },
      relations: ['user', 'exercise'],
    });
    if (!favorite) {
      throw new NotFoundException(`Favorito con ID ${id} no encontrado`);
    }
    return favorite;
  }

  async findByUser(userId: number): Promise<Favorite[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return await this.favoriteRepository.find({
      where: { userId },
      relations: ['exercise', 'exercise.exerciseType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByExercise(exerciseId: number): Promise<Favorite[]> {
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${exerciseId} no encontrado`);
    }

    return await this.favoriteRepository.find({
      where: { exerciseId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorite(userId: number, exerciseId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, exerciseId },
    });
    return !!favorite;
  }

  async update(id: number, updateFavoriteDto: UpdateFavoriteDto): Promise<Favorite> {
    const favorite = await this.findById(id);

    if (updateFavoriteDto.userId && updateFavoriteDto.userId !== favorite.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateFavoriteDto.userId },
      });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateFavoriteDto.userId} no encontrado`);
      }
    }

    if (updateFavoriteDto.exerciseId && updateFavoriteDto.exerciseId !== favorite.exerciseId) {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: updateFavoriteDto.exerciseId },
      });
      if (!exercise) {
        throw new NotFoundException(`Ejercicio con ID ${updateFavoriteDto.exerciseId} no encontrado`);
      }
    }

    await this.favoriteRepository.update(id, updateFavoriteDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const favorite = await this.findById(id);
    await this.favoriteRepository.delete(id);
    return {
      message: `Ejercicio eliminado de favoritos correctamente`,
    };
  }

  async removeByUserAndExercise(userId: number, exerciseId: number): Promise<{ message: string }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, exerciseId },
    });
    if (!favorite) {
      throw new NotFoundException(`El ejercicio no está en favoritos del usuario`);
    }

    await this.favoriteRepository.delete(favorite.id);
    return {
      message: `Ejercicio eliminado de favoritos correctamente`,
    };
  }

  async toggleFavorite(userId: number, exerciseId: number): Promise<{ isFavorite: boolean; message: string }> {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, exerciseId },
    });

    if (existing) {
      await this.favoriteRepository.delete(existing.id);
      return { isFavorite: false, message: 'Ejercicio eliminado de favoritos' };
    } else {
      await this.create({ userId, exerciseId });
      return { isFavorite: true, message: 'Ejercicio agregado a favoritos' };
    }
  }
}