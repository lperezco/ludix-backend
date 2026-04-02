import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const { postId, reportedBy, reason, status = 'pending' } = createReportDto;

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException(`Post con ID ${postId} no encontrado`);
    }

    const reporter = await this.userRepository.findOne({
      where: { id: reportedBy },
    });
    if (!reporter) {
      throw new NotFoundException(`Usuario con ID ${reportedBy} no encontrado`);
    }

    const existingReport = await this.reportRepository.findOne({
      where: {
        postId,
        reportedBy,
        status: 'pending',
      },
    });
    if (existingReport) {
      throw new ConflictException(`Ya has reportado este post. Estado: ${existingReport.status}`);
    }

    const report = this.reportRepository.create({
      postId,
      reportedBy,
      reason,
      status,
    });

    return await this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return await this.reportRepository.find({
      relations: ['post', 'reportedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['post', 'reportedByUser', 'post.profile', 'post.profile.user'],
    });
    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    return report;
  }

  async findByUser(userId: number): Promise<Report[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return await this.reportRepository.find({
      where: { reportedBy: userId },
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPost(postId: number): Promise<Report[]> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException(`Post con ID ${postId} no encontrado`);
    }

    return await this.reportRepository.find({
      where: { postId },
      relations: ['reportedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Report[]> {
    const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
    }

    return await this.reportRepository.find({
      where: { status },
      relations: ['post', 'reportedByUser'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatus(
    id: number,
    status: string,
  ): Promise<Report> {
    const report = await this.findById(id);

    const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
    }

    await this.reportRepository.update(id, { status });
    return this.findById(id);
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findById(id);

    if (updateReportDto.postId && updateReportDto.postId !== report.postId) {
      const post = await this.postRepository.findOne({
        where: { id: updateReportDto.postId },
      });
      if (!post) {
        throw new NotFoundException(`Post con ID ${updateReportDto.postId} no encontrado`);
      }
    }

    if (updateReportDto.reportedBy && updateReportDto.reportedBy !== report.reportedBy) {
      const user = await this.userRepository.findOne({
        where: { id: updateReportDto.reportedBy },
      });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateReportDto.reportedBy} no encontrado`);
      }
    }

    await this.reportRepository.update(id, updateReportDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const report = await this.findById(id);
    await this.reportRepository.delete(id);
    return {
      message: `Reporte del post ${report.postId} eliminado correctamente`,
    };
  }

  async removeByPost(postId: number): Promise<{ message: string }> {
    const reports = await this.findByPost(postId);
    if (reports.length === 0) {
      throw new NotFoundException(`No hay reportes para el post ${postId}`);
    }

    const result = await this.reportRepository.delete({ postId });
    return {
      message: `Se eliminaron ${result.affected} reportes del post ${postId}`,
    };
  }
}