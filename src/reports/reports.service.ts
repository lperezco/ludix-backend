import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
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

  /**
   * Crear un nuevo reporte
   */
  async create(createReportDto: CreateReportDto): Promise<Report> {
    const { postId, reportedBy, reason, status = 'pendiente' } = createReportDto;

    // Verificar que el post existe
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException(`Post con ID ${postId} no encontrado`);
    }

    // Verificar que el usuario que reporta existe
    const reporter = await this.userRepository.findOne({
      where: { id: reportedBy },
    });
    if (!reporter) {
      throw new NotFoundException(`Usuario con ID ${reportedBy} no encontrado`);
    }

    // Verificar que el usuario no está reportando su propio post
    if (post.userId === reportedBy) {
      throw new BadRequestException('No puedes reportar tu propio post');
    }

    // Verificar si ya existe un reporte pendiente para este post del mismo usuario
    const existingReport = await this.reportRepository.findOne({
      where: {
        postId,
        reportedBy,
        status: 'pendiente',
      },
    });

    if (existingReport) {
      throw new BadRequestException(
        `Ya has reportado este post. Estado actual: ${existingReport.status}`,
      );
    }

    // Crear el reporte
    const report = this.reportRepository.create({
      postId,
      reportedBy,
      reason,
      status,
    });

    return await this.reportRepository.save(report);
  }

  /**
   * Obtener todos los reportes
   */
  async findAll(
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Report[]; total: number; page: number; totalPages: number }> {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.reportRepository.findAndCount({
      where,
      relations: ['post', 'reportedByUser'],
      order: { createdAt: 'DESC' },
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
   * Obtener un reporte por ID
   */
  async findById(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['post', 'reportedByUser', 'post.user'],
    });

    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return report;
  }

  /**
   * Obtener reportes por usuario
   */
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

  /**
   * Obtener reportes por post
   */
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

  /**
   * Obtener reportes por estado
   */
  async findByStatus(status: string): Promise<Report[]> {
    const validStatuses = ['pendiente', 'revisando', 'aprobado', 'rechazado'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Estado inválido. Debe ser: ${validStatuses.join(', ')}`,
      );
    }

    return await this.reportRepository.find({
      where: { status },
      relations: ['post', 'reportedByUser'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Actualizar un reporte
   */
  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findById(id);

    // Si se actualiza el estado, registrar en log
    if (updateReportDto.status && updateReportDto.status !== report.status) {
      // Aquí podrías agregar lógica de notificación
      console.log(`Reporte ${id} cambió de estado: ${report.status} -> ${updateReportDto.status}`);
    }

    // Si se cambia el postId, verificar que existe
    if (updateReportDto.postId && updateReportDto.postId !== report.postId) {
      const post = await this.postRepository.findOne({
        where: { id: updateReportDto.postId },
      });
      if (!post) {
        throw new NotFoundException(`Post con ID ${updateReportDto.postId} no encontrado`);
      }
    }

    // Si se cambia el usuario que reporta, verificar que existe
    if (updateReportDto.reportedBy && updateReportDto.reportedBy !== report.reportedBy) {
      const user = await this.userRepository.findOne({
        where: { id: updateReportDto.reportedBy },
      });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${updateReportDto.reportedBy} no encontrado`);
      }
    }

    // Actualizar
    await this.reportRepository.update(id, updateReportDto);
    
    return this.findById(id);
  }

  /**
   * Actualizar estado de un reporte (método específico)
   */
  async updateStatus(
    id: number,
    status: string,
    moderatorComment?: string,
    reviewedBy?: number,
  ): Promise<Report> {
    const report = await this.findById(id);

    const validStatuses = ['pendiente', 'revisando', 'aprobado', 'rechazado'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Estado inválido. Debe ser: ${validStatuses.join(', ')}`,
      );
    }

    // Si se está aprobando y el reporte está pendiente
    if (status === 'aprobado' && report.status === 'pendiente') {
      // Aquí podrías agregar lógica para ocultar/eliminar el post
      console.log(`Reporte ${id} aprobado. El post ${report.postId} será revisado`);
    }

    const updateData: any = { status };
    if (moderatorComment) {
      updateData.moderatorComment = moderatorComment;
    }
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    await this.reportRepository.update(id, updateData);
    
    return this.findById(id);
  }

  /**
   * Eliminar un reporte
   */
  async remove(id: number): Promise<{ message: string }> {
    const report = await this.findById(id);
    
    const result = await this.reportRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }
    
    return {
      message: `Reporte de post ${report.postId} (ID: ${id}) eliminado correctamente`,
    };
  }

  /**
   * Eliminar todos los reportes de un post
   */
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

  /**
   * Obtener estadísticas de reportes
   */
  async getStats(): Promise<any> {
    const total = await this.reportRepository.count();
    const pendientes = await this.reportRepository.count({ where: { status: 'pendiente' } });
    const revisando = await this.reportRepository.count({ where: { status: 'revisando' } });
    const aprobados = await this.reportRepository.count({ where: { status: 'aprobado' } });
    const rechazados = await this.reportRepository.count({ where: { status: 'rechazado' } });

    // Reportes por día (últimos 7 días)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentReports = await this.reportRepository.count({
      where: {
        createdAt: MoreThan(last7Days),
      },
    });

    return {
      total,
      byStatus: {
        pendientes,
        revisando,
        aprobados,
        rechazados,
      },
      recent: {
        last7Days: recentReports,
      },
    };
  }
}