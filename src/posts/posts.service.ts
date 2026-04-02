import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { Report } from '../reports/entities/report.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  /**
   * Crear un nuevo post
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { profileId, challengeId, content, imageUrl } = createPostDto;

    // Verificar que el perfil existe
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${profileId} no encontrado`);
    }

    // Verificar que el challenge existe
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge con ID ${challengeId} no encontrado`);
    }

    // Crear el post
    const post = this.postRepository.create({
      profileId,
      challengeId,
      content,
      imageUrl,
    });

    return await this.postRepository.save(post);
  }

  /**
   * Obtener todos los posts (con paginación y filtros)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    challengeId?: number,
    profileId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: Post[]; total: number; page: number; totalPages: number }> {
    const where: any = {};
    
    if (challengeId) {
      where.challengeId = challengeId;
    }
    
    if (profileId) {
      where.profileId = profileId;
    }
    
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThan(startDate);
    } else if (endDate) {
      where.date = LessThan(endDate);
    }

    const [data, total] = await this.postRepository.findAndCount({
      where,
      relations: ['profile', 'profile.user', 'challenge'],
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un post por ID
   */
  async findById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['profile', 'profile.user', 'challenge', 'reports'],
    });

    if (!post) {
      throw new NotFoundException(`Post con ID ${id} no encontrado`);
    }

    return post;
  }

  /**
   * Obtener posts de un perfil específico
   */
  async findByProfile(profileId: number, page: number = 1, limit: number = 10): Promise<any> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${profileId} no encontrado`);
    }

    return this.findAll(page, limit, undefined, profileId);
  }

  /**
   * Obtener posts de un challenge específico
   */
  async findByChallenge(challengeId: number, page: number = 1, limit: number = 10): Promise<any> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge con ID ${challengeId} no encontrado`);
    }

    return this.findAll(page, limit, challengeId);
  }

  /**
   * Obtener posts recientes (últimos N días)
   */
  async findRecent(days: number = 7): Promise<Post[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    return await this.postRepository.find({
      where: {
        date: MoreThan(dateLimit),
      },
      relations: ['profile', 'profile.user', 'challenge'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Actualizar un post
   */
  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);

    // Si se actualiza el profileId, verificar que existe
    if (updatePostDto.profileId && updatePostDto.profileId !== post.profileId) {
      const profile = await this.profileRepository.findOne({
        where: { id: updatePostDto.profileId },
      });
      if (!profile) {
        throw new NotFoundException(`Perfil con ID ${updatePostDto.profileId} no encontrado`);
      }
    }

    // Si se actualiza el challengeId, verificar que existe
    if (updatePostDto.challengeId && updatePostDto.challengeId !== post.challengeId) {
      const challenge = await this.challengeRepository.findOne({
        where: { id: updatePostDto.challengeId },
      });
      if (!challenge) {
        throw new NotFoundException(`Challenge con ID ${updatePostDto.challengeId} no encontrado`);
      }
    }

    // Actualizar
    await this.postRepository.update(id, updatePostDto);
    
    return this.findById(id);
  }

  /**
   * Eliminar un post
   */
  async remove(id: number): Promise<{ message: string }> {
    const post = await this.findById(id);

    // Verificar si el post tiene reportes
    if (post.reports && post.reports.length > 0) {
      // Primero eliminar los reportes asociados
      await this.reportRepository.delete({ postId: id });
    }

    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post con ID ${id} no encontrado`);
    }

    return {
      message: `Post de ${post.profile?.user?.name || 'usuario'} (ID: ${id}) eliminado correctamente. Se eliminaron ${post.reports?.length || 0} reportes asociados.`,
    };
  }

  /**
   * Eliminar todos los posts de un perfil
   */
  async removeByProfile(profileId: number): Promise<{ message: string }> {
    const posts = await this.postRepository.find({
      where: { profileId },
    });

    if (posts.length === 0) {
      throw new NotFoundException(`No hay posts para el perfil ${profileId}`);
    }

    // Eliminar reportes asociados primero
    const postIds = posts.map(post => post.id);
    await this.reportRepository.delete({ postId: In(postIds) });

    const result = await this.postRepository.delete({ profileId });

    return {
      message: `Se eliminaron ${result.affected} posts del perfil ${profileId}`,
    };
  }

  /**
   * Obtener estadísticas de posts
   */
  async getStats(): Promise<any> {
    const total = await this.postRepository.count();
    
    // Posts por challenge
    const postsByChallenge = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.challenge', 'challenge')
      .select('challenge.id', 'challengeId')
      .addSelect('challenge.name', 'challengeName')
      .addSelect('COUNT(post.id)', 'count')
      .groupBy('challenge.id')
      .addGroupBy('challenge.name')
      .getRawMany();

    // Posts por día (últimos 7 días)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const postsLast7Days = await this.postRepository
      .createQueryBuilder('post')
      .select('DATE(post.date)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('post.date > :last7Days', { last7Days })
      .groupBy('DATE(post.date)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Posts con imagen vs sin imagen
    const postsWithImage = await this.postRepository.count({
      where: { imageUrl: Not(IsNull()) },
    });
    const postsWithoutImage = total - postsWithImage;

    return {
      total,
      withImage: postsWithImage,
      withoutImage: postsWithoutImage,
      byChallenge: postsByChallenge,
      last7Days: postsLast7Days,
    };
  }

  /**
   * Buscar posts por contenido
   */
  async search(searchTerm: string, page: number = 1, limit: number = 10): Promise<any> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.findAll(page, limit);
    }

    const [data, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('post.challenge', 'challenge')
      .where('post.content ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('user.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('challenge.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('post.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener posts populares (con más reportes o interacciones)
   */
  async getPopular(limit: number = 10): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('post.challenge', 'challenge')
      .leftJoin('post.reports', 'reports')
      .addSelect('COUNT(reports.id)', 'reportCount')
      .groupBy('post.id')
      .addGroupBy('profile.id')
      .addGroupBy('user.id')
      .addGroupBy('challenge.id')
      .orderBy('reportCount', 'DESC')
      .addOrderBy('post.date', 'DESC')
      .limit(limit)
      .getMany();
  }
}