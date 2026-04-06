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
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ExerciseHistoryService } from './exercise-history.service';
import { CreateExerciseHistoryDto } from './dto/create-exercise-history.dto';
import { UpdateExerciseHistoryDto } from './dto/update-exercise-history.dto';

@Controller('exercise-history')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExerciseHistoryController {
  constructor(private readonly exerciseHistoryService: ExerciseHistoryService) {}

  /**
   * Obtener todo el historial (solo admin)
   * GET /exercise-history?page=1&limit=10&userId=1&exerciseId=1&startDate=2024-01-01&endDate=2024-12-31
   */
  @Get()
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('exerciseId') exerciseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exerciseHistoryService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      userId ? parseInt(userId) : undefined,
      exerciseId ? parseInt(exerciseId) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener estadísticas globales (solo admin)
   * GET /exercise-history/stats/global
   */
  @Get('stats/global')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async getGlobalStats() {
    return this.exerciseHistoryService.getGlobalStats();
  }

  /**
   * Obtener estadísticas de un usuario (solo admin)
   * GET /exercise-history/stats/user/:userId
   */
  @Get('stats/user/:userId')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.exerciseHistoryService.getUserStats(userId);
  }

  /**
   * Obtener mis estadísticas (usuario autenticado)
   * GET /exercise-history/stats/me
   */
  @Get('stats/me')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  async getMyStats(@Req() req: any) {
    const userId = req.user?.id; // Ajusta según el payload de tu JWT (puede ser req.user.userId)
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.exerciseHistoryService.getUserStats(userId);
  }

  /**
   * Obtener historial de un usuario (solo admin)
   * GET /exercise-history/user/:userId
   */
  @Get('user/:userId')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exerciseHistoryService.findByUser(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener mi historial (usuario autenticado)
   * GET /exercise-history/me
   */
  @Get('me')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  async getMyHistory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.exerciseHistoryService.findByUser(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener mi historial de hoy (usuario autenticado)
   * GET /exercise-history/me/today
   */
  @Get('me/today')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  async getTodayHistory(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.exerciseHistoryService.getTodayHistory(userId);
  }

  /**
   * Obtener mi historial de la semana (usuario autenticado)
   * GET /exercise-history/me/week
   */
  @Get('me/week')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  async getCurrentWeekHistory(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.exerciseHistoryService.getCurrentWeekHistory(userId);
  }

  /**
   * Obtener mi racha actual (usuario autenticado)
   * GET /exercise-history/me/streak
   */
  @Get('me/streak')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  async getCurrentStreak(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const streak = await this.exerciseHistoryService.getCurrentStreak(userId);
    return { userId, streak };
  }

  /**
   * Obtener historial de un ejercicio (solo admin)
   * GET /exercise-history/exercise/:exerciseId
   */
  @Get('exercise/:exerciseId')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async findByExercise(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exerciseHistoryService.findByExercise(
      exerciseId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener historial por rango de fechas (solo admin)
   * GET /exercise-history/date-range?start=2024-01-01&end=2024-12-31&userId=1
   */
  @Get('date-range')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async findByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.exerciseHistoryService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      userId ? parseInt(userId) : undefined,
    );
  }

  /**
   * Obtener un registro por ID (solo admin)
   * GET /exercise-history/:id
   */
  @Get(':id')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseHistoryService.findById(id);
  }

  /**
   * Registrar un ejercicio completado (cualquier usuario autenticado)
   * POST /exercise-history
   */
  @Post()
  @Permissions('view_stats')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExerciseHistoryDto: CreateExerciseHistoryDto) {
    return this.exerciseHistoryService.create(createExerciseHistoryDto);
  }

  /**
   * Registrar mi ejercicio completado (usuario autenticado)
   * POST /exercise-history/me/:exerciseId
   */
  @Post('me/:exerciseId')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.CREATED)
  async addToMyHistory(
    @Req() req: any,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body('completedAt') completedAt?: Date,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.exerciseHistoryService.create({
      userId,
      exerciseId,
      completedAt: completedAt || new Date(),
    });
  }

  /**
   * Actualizar un registro (solo admin)
   * PUT /exercise-history/:id
   */
  @Put(':id')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseHistoryDto: UpdateExerciseHistoryDto,
  ) {
    return this.exerciseHistoryService.update(id, updateExerciseHistoryDto);
  }

  /**
   * Eliminar un registro (solo admin)
   * DELETE /exercise-history/:id
   */
  @Delete(':id')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseHistoryService.remove(id);
  }

  /**
   * Eliminar mi historial (usuario autenticado)
   * DELETE /exercise-history/me
   */
  @Delete('me')
  @Permissions('view_stats')
  @HttpCode(HttpStatus.OK)
  async removeMyHistory(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.exerciseHistoryService.removeByUser(userId);
  }

  /**
   * Eliminar todo el historial de un usuario (solo admin)
   * DELETE /exercise-history/user/:userId
   */
  @Delete('user/:userId')
  @Permissions('manage_users')
  @HttpCode(HttpStatus.OK)
  async removeByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.exerciseHistoryService.removeByUser(userId);
  }
}
