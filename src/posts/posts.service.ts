import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { profileId, challengeId, content, imageUrl } = createPostDto;

    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${profileId} no encontrado`);
    }

    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge con ID ${challengeId} no encontrado`);
    }

    const post = this.postRepository.create({
      profileId,
      challengeId,
      content,
      imageUrl,
    });

    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['profile', 'profile.user', 'challenge', 'reports'],
      order: { date: 'DESC' },
    });
  }

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

  async findByProfile(profileId: number): Promise<Post[]> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${profileId} no encontrado`);
    }

    return await this.postRepository.find({
      where: { profileId },
      relations: ['challenge'],
      order: { date: 'DESC' },
    });
  }

  async findByChallenge(challengeId: number): Promise<Post[]> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge con ID ${challengeId} no encontrado`);
    }

    return await this.postRepository.find({
      where: { challengeId },
      relations: ['profile', 'profile.user'],
      order: { date: 'DESC' },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);

    if (updatePostDto.profileId && updatePostDto.profileId !== post.profileId) {
      const profile = await this.profileRepository.findOne({
        where: { id: updatePostDto.profileId },
      });
      if (!profile) {
        throw new NotFoundException(`Perfil con ID ${updatePostDto.profileId} no encontrado`);
      }
    }

    if (updatePostDto.challengeId && updatePostDto.challengeId !== post.challengeId) {
      const challenge = await this.challengeRepository.findOne({
        where: { id: updatePostDto.challengeId },
      });
      if (!challenge) {
        throw new NotFoundException(`Challenge con ID ${updatePostDto.challengeId} no encontrado`);
      }
    }

    await this.postRepository.update(id, updatePostDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const post = await this.findById(id);

    const reportsCount = await this.reportRepository.count({
      where: { postId: id },
    });

    if (reportsCount > 0) {
      await this.reportRepository.delete({ postId: id });
    }

    await this.postRepository.delete(id);
    return {
      message: `Post eliminado correctamente. Se eliminaron ${reportsCount} reportes asociados.`,
    };
  }

  async removeByProfile(profileId: number): Promise<{ message: string }> {
    const posts = await this.findByProfile(profileId);
    if (posts.length === 0) {
      throw new NotFoundException(`No hay posts para el perfil ${profileId}`);
    }

    const postIds = posts.map(post => post.id);
    await this.reportRepository.delete(postIds.map(id => ({ postId: id })));
    const result = await this.postRepository.delete({ profileId });

    return {
      message: `Se eliminaron ${result.affected} posts del perfil ${profileId}`,
    };
  }
}