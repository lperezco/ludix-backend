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
import { UserAchievementsService } from './user-achievements.service';
import { CreateUserAchievementDto } from './dto/create-user-achievement.dto';
import { UpdateUserAchievementDto } from './dto/update-user-achievement.dto';

@Controller('user-achievements')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserAchievementsController {
  constructor(private readonly userAchievementsService: UserAchievementsService) {}

  /**
   * Obtener todas las relaciones usuario-logro
   * GET /user-achievements
   */
  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.userAchievementsService.findAll();
  }

  /**
   * Obtener logros por usuario o por logro mediante query params
   * GET /user-achievements?userId=1
   * GET /user-achievements?achievementId=1
   */
  @Get('filter')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findByFilter(
    @Query('userId') userId?: string,
    @Query('achievementId') achievementId?: string,
  ) {
    if (userId) {
      return this.userAchievementsService.findByUser(+userId);
    }
    if (achievementId) {
      return this.userAchievementsService.findByAchievement(+achievementId);
    }
    return this.userAchievementsService.findAll();
  }

  /**
   * Obtener todos los logros de un usuario
   * GET /user-achievements/user/:userId
   */
  @Get('user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userAchievementsService.findByUser(userId);
  }

  /**
   * Obtener todos los usuarios que tienen un logro específico
   * GET /user-achievements/achievement/:achievementId
   */
  @Get('achievement/:achievementId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findByAchievement(@Param('achievementId', ParseIntPipe) achievementId: number) {
    return this.userAchievementsService.findByAchievement(achievementId);
  }

  /**
   * Obtener una relación por ID
   * GET /user-achievements/:id
   */
  @Get(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userAchievementsService.findById(id);
  }

  /**
   * Verificar si un usuario tiene un logro
   * GET /user-achievements/check/:userId/:achievementId
   */
  @Get('check/:userId/:achievementId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async checkAchievement(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('achievementId', ParseIntPipe) achievementId: number,
  ) {
    const has = await this.userAchievementsService.hasAchievement(userId, achievementId);
    return { 
      userId, 
      achievementId, 
      has,
      message: has ? 'El usuario tiene este logro' : 'El usuario no tiene este logro'
    };
  }

  /**
   * Asignar un logro a un usuario
   * POST /user-achievements
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserAchievementDto: CreateUserAchievementDto) {
    return this.userAchievementsService.create(createUserAchievementDto);
  }

  /**
   * Actualizar una relación usuario-logro
   * PUT /user-achievements/:id
   */
  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserAchievementDto: UpdateUserAchievementDto,
  ) {
    return this.userAchievementsService.update(id, updateUserAchievementDto);
  }

  /**
   * Eliminar una relación usuario-logro
   * DELETE /user-achievements/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userAchievementsService.remove(id);
  }

  /**
   * Eliminar todos los logros de un usuario
   * DELETE /user-achievements/user/:userId
   */
  @Delete('user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  removeAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userAchievementsService.removeAllByUser(userId);
  }
}