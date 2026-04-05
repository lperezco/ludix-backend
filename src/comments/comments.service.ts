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

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
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

    return this.commentRepository.save(comment);
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
