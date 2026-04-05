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
  constructor(
    private readonly exerciseHistoryService: ExerciseHistoryService,
  ) {}

  /**
   * Obtener todo el historial (con paginación y filtros)
   * GET /exercise-history?page=1&limit=10&userId=1&exerciseId=1&startDate=2024-01-01&endDate=2024-12-31
   */
  @Get()
  @Permissions('admin')
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
   * Obtener estadísticas globales
   * GET /exercise-history/stats/global
   */
  @Get('stats/global')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  async getGlobalStats() {
    return this.exerciseHistoryService.getGlobalStats();
  }

  /**
   * Obtener estadísticas de un usuario
   * GET /exercise-history/stats/user/:userId
   */
  @Get('stats/user/:userId')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.exerciseHistoryService.getUserStats(userId);
  }

  /**
   * Obtener mis estadísticas (usuario autenticado)
   * GET /exercise-history/stats/me
   */
  @Get('stats/me')
  @Permissions('user')
  @HttpCode(HttpStatus.OK)
  async getMyStats() {
    const userId = 1;
    return this.exerciseHistoryService.getUserStats(userId);
  }

  /**
   * Obtener historial de un usuario
   * GET /exercise-history/user/:userId
   */
  @Get('user/:userId')
  @Permissions('admin')
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
  @Permissions('user')
  @HttpCode(HttpStatus.OK)
  async getMyHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = 1;
    return this.exerciseHistoryService.findByUser(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener mi historial de hoy
   * GET /exercise-history/me/today
   */
  @Get('me/today')
  @Permissions('user')
  @HttpCode(HttpStatus.OK)
  async getTodayHistory() {
    const userId = 1;
    return this.exerciseHistoryService.getTodayHistory(userId);
  }

  /**
   * Obtener mi historial de la semana
   * GET /exercise-history/me/week
   */
  @Get('me/week')
  @Permissions('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentWeekHistory() {
    const userId = 1;
    return this.exerciseHistoryService.getCurrentWeekHistory(userId);
  }

  /**
   * Obtener mi racha actual
   * GET /exercise-history/me/streak
   */
  @Get('me/streak')
  @Permissions('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentStreak() {
    const userId = 1;
    const streak = await this.exerciseHistoryService.getCurrentStreak(userId);
    return { userId, streak };
  }

  /**
   * Obtener historial de un ejercicio
   * GET /exercise-history/exercise/:exerciseId
   */
  @Get('exercise/:exerciseId')
  @Permissions('admin')
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
   * Obtener historial por rango de fechas
   * GET /exercise-history/date-range?start=2024-01-01&end=2024-12-31&userId=1
   */
  @Get('date-range')
  @Permissions('admin')
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
   * Obtener un registro por ID
   * GET /exercise-history/:id
   */
  @Get(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseHistoryService.findById(id);
  }

  /**
   * Registrar un ejercicio completado
   * POST /exercise-history
   */
  @Post()
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExerciseHistoryDto: CreateExerciseHistoryDto) {
    return this.exerciseHistoryService.create(createExerciseHistoryDto);
  }

  /**
   * Registrar mi ejercicio completado
   * POST /exercise-history/me/:exerciseId
   */
  @Post('me/:exerciseId')
  @Permissions('user')
  @HttpCode(HttpStatus.CREATED)
  async addToMyHistory(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body('completedAt') completedAt?: Date,
  ) {
    const userId = 1;
    return this.exerciseHistoryService.create({
      userId,
      exerciseId,
      completedAt: completedAt || new Date(),
    });
  }

  /**
   * Actualizar un registro
   * PUT /exercise-history/:id
   */
  @Put(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseHistoryDto: UpdateExerciseHistoryDto,
  ) {
    return this.exerciseHistoryService.update(id, updateExerciseHistoryDto);
  }

  /**
   * Eliminar un registro
   * DELETE /exercise-history/:id
   */
  @Delete(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseHistoryService.remove(id);
  }

  /**
   * Eliminar mi historial
   * DELETE /exercise-history/me
   */
  @Delete('me')
  @Permissions('user')
  @HttpCode(HttpStatus.OK)
  async removeMyHistory() {
    const userId = 1;
    return this.exerciseHistoryService.removeByUser(userId);
  }

  /**
   * Eliminar todo el historial de un usuario
   * DELETE /exercise-history/user/:userId
   */
  @Delete('user/:userId')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  async removeByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.exerciseHistoryService.removeByUser(userId);
  }
}
