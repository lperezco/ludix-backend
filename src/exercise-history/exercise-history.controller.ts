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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExerciseHistoryService } from './exercise-history.service';
import { CreateExerciseHistoryDto } from './dto/create-exercise-history.dto';
import { UpdateExerciseHistoryDto } from './dto/update-exercise-history.dto';

@Controller('exercise-history')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExerciseHistoryController {
  constructor(private readonly exerciseHistoryService: ExerciseHistoryService) {}

  /**
   * Obtener todo el historial (con paginación y filtros)
   * GET /exercise-history?page=1&limit=10&userId=1&exerciseId=1&startDate=2024-01-01&endDate=2024-12-31
   */
  @Get()
  @Roles('admin')
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
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getGlobalStats() {
    return this.exerciseHistoryService.getGlobalStats();
  }

  /**
   * Obtener estadísticas de un usuario
   * GET /exercise-history/stats/user/:userId
   */
  @Get('stats/user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.exerciseHistoryService.getUserStats(userId);
  }

  /**
   * Obtener mis estadísticas (usuario autenticado)
   * GET /exercise-history/stats/me
   */
  @Get('stats/me')
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async getMyStats() {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
    return this.exerciseHistoryService.getUserStats(userId);
  }

  /**
   * Obtener historial de un usuario
   * GET /exercise-history/user/:userId
   */
  @Get('user/:userId')
  @Roles('admin')
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
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async getMyHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
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
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async getTodayHistory() {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
    return this.exerciseHistoryService.getTodayHistory(userId);
  }

  /**
   * Obtener mi historial de la semana
   * GET /exercise-history/me/week
   */
  @Get('me/week')
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentWeekHistory() {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
    return this.exerciseHistoryService.getCurrentWeekHistory(userId);
  }

  /**
   * Obtener mi racha actual
   * GET /exercise-history/me/streak
   */
  @Get('me/streak')
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentStreak() {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
    const streak = await this.exerciseHistoryService.getCurrentStreak(userId);
    return { userId, streak };
  }

  /**
   * Obtener historial de un ejercicio
   * GET /exercise-history/exercise/:exerciseId
   */
  @Get('exercise/:exerciseId')
  @Roles('admin')
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
  @Roles('admin')
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
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseHistoryService.findById(id);
  }

  /**
   * Registrar un ejercicio completado
   * POST /exercise-history
   */
  @Post()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExerciseHistoryDto: CreateExerciseHistoryDto) {
    return this.exerciseHistoryService.create(createExerciseHistoryDto);
  }

  /**
   * Registrar mi ejercicio completado
   * POST /exercise-history/me/:exerciseId
   */
  @Post('me/:exerciseId')
  @Roles('user')
  @HttpCode(HttpStatus.CREATED)
  async addToMyHistory(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body('completedAt') completedAt?: Date,
  ) {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
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
  @Roles('admin')
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
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseHistoryService.remove(id);
  }

  /**
   * Eliminar mi historial
   * DELETE /exercise-history/me
   */
  @Delete('me')
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async removeMyHistory() {
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
    return this.exerciseHistoryService.removeByUser(userId);
  }

  /**
   * Eliminar todo el historial de un usuario
   * DELETE /exercise-history/user/:userId
   */
  @Delete('user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.exerciseHistoryService.removeByUser(userId);
  }
}