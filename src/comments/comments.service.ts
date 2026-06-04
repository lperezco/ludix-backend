import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { IsNull } from 'typeorm';
import { UserAchievement } from '../user-achievements/entities/user-achievement.entity';
import { Achievement } from '../achievements/entities/achievement.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { userId, exerciseId, content, parentCommentId } = createCommentDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(`
        Ejercicio con ID ${exerciseId} no encontrado`);
    }

    if (parentCommentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: parentCommentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Comentario padre con ID ${parentCommentId} no encontrado`,
        );
      }
    }

    const comment = this.commentRepository.create({
      userId,
      exerciseId,
      content,
      parentCommentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // 🎯 OTORGAR LOGRO: Primer comentario
    try {
      // Buscar el logro "Primer comentario"
      const firstCommentAchievement = await this.achievementRepository.findOne({
        where: { name: 'Primer comentario' },
      });

      if (firstCommentAchievement) {
        // Verificar si el usuario ya tiene este logro
        const existingAchievement = await this.userAchievementRepository.findOne({
          where: {
            userId,
            achievementId: firstCommentAchievement.id,
          },
        });

        if (!existingAchievement) {
          // Otorgar el logro
          await this.userAchievementRepository.save({
            userId,
            achievementId: firstCommentAchievement.id,
            dateOfAchievement: new Date(),
          });
          console.log(`🎉 Logro "Primer comentario" otorgado al usuario ${userId}`);
        }
      } else {
        console.warn('No se encontró el logro "Primer comentario" en la base de datos');
      }
    } catch (error) {
      // No debe romper la creación del comentario si falla el logro
      console.error('Error al otorgar logro de comentario:', error);
    }

    return savedComment;
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({
      relations: ['user', 'exercise', 'replies', 'reports'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'exercise', 'replies', 'reports', 'replies.user'],
    });
    if (!comment) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }
    return comment;
  }

  async findByExercise(exerciseId: number): Promise<Comment[]> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(`
        Ejercicio con ID ${exerciseId} no encontrado`);
    }
    return this.commentRepository.find({
      where: { exerciseId, parentCommentId: IsNull() },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByUser(userId: number): Promise<Comment[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return this.commentRepository.find({
      where: { userId },
      relations: ['exercise'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    await this.findById(id);
    const { content } = updateCommentDto;
    if (!content) {
      throw new BadRequestException(
        'El contenido es requerido para actualizar',
      );
    }
    await this.commentRepository.update(id, { content });
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const comment = await this.findById(id);
    if (comment.replies && comment.replies.length) {
      await this.commentRepository.delete(comment.replies.map((r) => r.id));
    }
    await this.commentRepository.delete(id);
    return { message: `Comentario con ID ${id} eliminado correctamente` };
  }
}