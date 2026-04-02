import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Obtener todos los reportes (con filtros y paginación)
   * GET /reports?status=pendiente&page=1&limit=10
   */
  @Get()
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.findAll(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Obtener estadísticas de reportes
   * GET /reports/stats
   */
  @Get('stats')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.reportsService.getStats();
  }

  /**
   * Obtener reportes por usuario
   * GET /reports/user/:userId
   */
  @Get('user/:userId')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reportsService.findByUser(userId);
  }

  /**
   * Obtener reportes por post
   * GET /reports/post/:postId
   */
  @Get('post/:postId')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.reportsService.findByPost(postId);
  }

  /**
   * Obtener reportes por estado
   * GET /reports/status/:status
   */
  @Get('status/:status')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async findByStatus(@Param('status') status: string) {
    return this.reportsService.findByStatus(status);
  }

  /**
   * Obtener un reporte por ID
   * GET /reports/:id
   */
  @Get(':id')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findById(id);
  }

  /**
   * Crear un nuevo reporte (cualquier usuario autenticado)
   * POST /reports
   */
  @Post()
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  /**
   * Actualizar un reporte
   * PUT /reports/:id
   */
  @Put(':id')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, updateReportDto);
  }

  /**
   * Actualizar estado de un reporte (acción rápida)
   * PATCH /reports/:id/status
   */
  @Patch(':id/status')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('moderatorComment') moderatorComment?: string,
    @Body('reviewedBy') reviewedBy?: number,
  ) {
    return this.reportsService.updateStatus(id, status, moderatorComment, reviewedBy);
  }

  /**
   * Eliminar un reporte
   * DELETE /reports/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }

  /**
   * Eliminar todos los reportes de un post
   * DELETE /reports/post/:postId
   */
  @Delete('post/:postId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.reportsService.removeByPost(postId);
  }
}