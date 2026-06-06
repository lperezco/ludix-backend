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

    console.log(`📝 Creando comentario - userId: ${userId}, exerciseId: ${exerciseId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException(`Ejercicio con ID ${exerciseId} no encontrado`);
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
    console.log(`✅ Comentario guardado con ID: ${savedComment.id}`);

    // Otorgar logro "Primer comentario" (solo si es el primero)
    this.grantFirstCommentAchievement(userId).catch((error) => {
      console.error('❌ Error no bloqueante al otorgar logro:', error);
    });

    // Otorgar logros por cantidad de comentarios
    this.grantCommentAchievements(userId).catch((error) => {
      console.error('❌ Error no bloqueante al otorgar logros de comentarios:', error);
    });

    return savedComment;
  }

  /**
   * Otorga el logro "Primer comentario" al usuario si es su primer comentario
   */
  private async grantFirstCommentAchievement(userId: number): Promise<void> {
    try {
      console.log(`🔍 [LOGRO] Verificando primer comentario para usuario ${userId}`);

      // 1. Contar comentarios del usuario
      const commentCount = await this.commentRepository.count({
        where: { userId },
      });
      console.log(`📊 [LOGRO] Usuario ${userId} tiene ${commentCount} comentario(s)`);

      // 2. Si no es el primer comentario, salir
      if (commentCount !== 1) {
        console.log(`⏭️ [LOGRO] No es el primer comentario (tiene ${commentCount})`);
        return;
      }

      // 3. Buscar el logro "Primer comentario"
      const achievementResult = await this.commentRepository.manager.query(
        `SELECT id FROM achievements WHERE name = $1 LIMIT 1`,
        ['Primer comentario'],
      );

      if (!achievementResult || achievementResult.length === 0) {
        console.warn('⚠️ [LOGRO] No se encontró el logro "Primer comentario" en la BD');
        return;
      }

      const achievementId = achievementResult[0].id;
      console.log(`🏆 [LOGRO] Logro "Primer comentario" encontrado con ID: ${achievementId}`);

      // 4. Verificar si ya tiene el logro
      const existingResult = await this.commentRepository.manager.query(
        `SELECT id FROM user_achievements WHERE "userId" = $1 AND "achievementId" = $2 LIMIT 1`,
        [userId, achievementId],
      );

      if (existingResult && existingResult.length > 0) {
        console.log(`✅ [LOGRO] Usuario ${userId} ya tiene este logro`);
        return;
      }

      // 5. Otorgar el logro
      await this.commentRepository.manager.query(
        `INSERT INTO user_achievements ("userId", "achievementId", "dateOfAchievement")
         VALUES ($1, $2, NOW())`,
        [userId, achievementId],
      );

      console.log(`🎉🎉🎉 [LOGRO] ¡LOGRO OTORGADO! "Primer comentario" al usuario ${userId}`);
    } catch (error) {
      console.error('❌ [LOGRO] Error en grantFirstCommentAchievement:', error);
    }
  }

  /**
   * Otorga logros relacionados con la cantidad de comentarios
   */
  private async grantCommentAchievements(userId: number): Promise<void> {
    try {
      console.log(`🏆 [LOGROS COMENTARIOS] Verificando para usuario ${userId}`);

      // Contar comentarios totales del usuario
      const totalComments = await this.commentRepository.count({
        where: { userId }
      });
      console.log(`📊 Total comentarios: ${totalComments}`);

      // Logro "Conversador" (5 comentarios)
      if (totalComments >= 5) {
        await this.grantAchievement(userId, 6, 'Conversador');
      }

      // Logro "Crítico" (10 comentarios)
      if (totalComments >= 10) {
        await this.grantAchievement(userId, 7, 'Crítico');
      }

      // Logro "Experto" (20 comentarios)
      if (totalComments >= 20) {
        await this.grantAchievement(userId, 8, 'Experto');
      }

    } catch (error) {
      console.error('❌ Error en grantCommentAchievements:', error);
    }
  }

  /**
   * Método auxiliar para otorgar un logro específico
   */
  private async grantAchievement(userId: number, achievementId: number, name: string): Promise<void> {
    try {
      // Verificar si ya tiene el logro
      const existing = await this.commentRepository.manager.query(
        `SELECT id FROM user_achievements WHERE "userId" = $1 AND "achievementId" = $2 LIMIT 1`,
        [userId, achievementId]
      );

      if (existing && existing.length > 0) {
        console.log(`⏭️ Usuario ${userId} ya tiene el logro "${name}"`);
        return;
      }

      // Otorgar logro
      await this.commentRepository.manager.query(
        `INSERT INTO user_achievements ("userId", "achievementId", "dateOfAchievement")
         VALUES ($1, $2, NOW())`,
        [userId, achievementId]
      );

      console.log(`🎉 ¡LOGRO OTORGADO! "${name}" al usuario ${userId}`);
    } catch (error) {
      console.error(`❌ Error al otorgar logro "${name}":`, error);
    }
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
      throw new NotFoundException(`Ejercicio con ID ${exerciseId} no encontrado`);
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
      throw new BadRequestException('El contenido es requerido para actualizar');
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
