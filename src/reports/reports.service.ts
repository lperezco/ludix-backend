import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateReportDto): Promise<Report> {
    const { commentId, reportedBy, reason, status = 'pending' } = createDto;

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException(
        `Comentario con ID ${commentId} no encontrado`,
      );
    }

    const reporter = await this.userRepository.findOne({
      where: { id: reportedBy },
    });
    if (!reporter) {
      throw new NotFoundException(`Usuario con ID ${reportedBy} no encontrado`);
    }

    // Evitar reportes duplicados pendientes del mismo usuario al mismo comentario
    const existing = await this.reportRepository.findOne({
      where: {
        commentId,
        reportedBy,
        status: 'pending',
      },
    });
    if (existing) {
      throw new ConflictException(
        'Ya has reportado este comentario y está pendiente de revisión',
      );
    }

    const report = this.reportRepository.create({
      commentId,
      reportedBy,
      reason,
      status,
    });
    return this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['comment', 'reportedByUser', 'comment.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['comment', 'reportedByUser', 'comment.user'],
    });
    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    return report;
  }

  async findByUser(userId: number): Promise<Report[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return this.reportRepository.find({
      where: { reportedBy: userId },
      relations: ['comment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByComment(commentId: number): Promise<Report[]> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException(
        `Comentario con ID ${commentId} no encontrado`,
      );
    }
    return this.reportRepository.find({
      where: { commentId },
      relations: ['reportedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Report[]> {
    const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      );
    }
    return this.reportRepository.find({
      where: { status },
      relations: ['comment', 'reportedByUser'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatus(id: number, status: string): Promise<Report> {
    await this.findById(id);
    const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`,
      );
    }
    await this.reportRepository.update(id, { status });
    return this.findById(id);
  }

  async update(id: number, updateDto: UpdateReportDto): Promise<Report> {
    const report = await this.findById(id);

    if (updateDto.commentId && updateDto.commentId !== report.commentId) {
      const comment = await this.commentRepository.findOne({
        where: { id: updateDto.commentId },
      });
      if (!comment) {
        throw new NotFoundException(
          `Comentario con ID ${updateDto.commentId} no encontrado`,
        );
      }
    }

    if (updateDto.reportedBy && updateDto.reportedBy !== report.reportedBy) {
      const user = await this.userRepository.findOne({
        where: { id: updateDto.reportedBy },
      });
      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${updateDto.reportedBy} no encontrado`,
        );
      }
    }

    await this.reportRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const report = await this.findById(id);
    await this.reportRepository.delete(id);
    return {
      message: `Reporte del comentario ${report.commentId} eliminado correctamente`,
    };
  }

  async removeByComment(commentId: number): Promise<{ message: string }> {
    const reports = await this.findByComment(commentId);
    if (reports.length === 0) {
      throw new NotFoundException(
        `No hay reportes para el comentario ${commentId}`,
      );
    }
    const result = await this.reportRepository.delete({ commentId });
    return {
      message: `Se eliminaron ${result.affected} reportes del comentario ${commentId}`,
    };
  }
}
