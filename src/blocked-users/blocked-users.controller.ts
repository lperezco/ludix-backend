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
import { BlockedUsersService } from './blocked-users.service';
import { CreateBlockedUserDto } from './dto/create-blocked-user.dto';
import { UpdateBlockedUserDto } from './dto/update-blocked-user.dto';

@Controller('blocked-users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BlockedUsersController {
  constructor(private readonly blockedUsersService: BlockedUsersService) {}

  /**
   * Obtener todos los bloqueos (con paginación y filtros)
   * GET /blocked-users?page=1&limit=10&isActive=true&userId=1&blockedBy=1&startDate=2024-01-01&endDate=2024-12-31
   */
  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
    @Query('userId') userId?: string,
    @Query('blockedBy') blockedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.blockedUsersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      isActive ? isActive === 'true' : undefined,
      userId ? parseInt(userId) : undefined,
      blockedBy ? parseInt(blockedBy) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener estadísticas de bloqueos
   * GET /blocked-users/stats
   */
  @Get('stats')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.blockedUsersService.getStats();
  }

  /**
   * Obtener bloqueos de un usuario
   * GET /blocked-users/user/:userId
   */
  @Get('user/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blockedUsersService.findByUser(
      userId,
      isActive ? isActive === 'true' : undefined,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Obtener bloqueos realizados por un usuario
   * GET /blocked-users/blocker/:blockerId
   */
  @Get('blocker/:blockerId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findByBlocker(
    @Param('blockerId', ParseIntPipe) blockerId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blockedUsersService.findByBlocker(
      blockerId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Verificar si un usuario está bloqueado
   * GET /blocked-users/check/:userId
   */
  @Get('check/:userId')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async isUserBlocked(@Param('userId', ParseIntPipe) userId: number) {
    const isBlocked = await this.blockedUsersService.isUserBlocked(userId);
    return {
      userId,
      isBlocked,
      message: isBlocked ? 'El usuario está bloqueado' : 'El usuario no está bloqueado',
    };
  }

  /**
   * Obtener bloqueo activo de un usuario
   * GET /blocked-users/active/:userId
   */
  @Get('active/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getActiveBlock(@Param('userId', ParseIntPipe) userId: number) {
    return this.blockedUsersService.getActiveBlock(userId);
  }

  /**
   * Obtener bloqueos expirados
   * GET /blocked-users/expired?days=30
   */
  @Get('expired')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getExpiredBlocks(@Query('days') days?: string) {
    return this.blockedUsersService.getExpiredBlocks(days ? parseInt(days) : 30);
  }

  /**
   * Obtener un bloqueo por ID
   * GET /blocked-users/:id
   */
  @Get(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blockedUsersService.findById(id);
  }

  /**
   * Bloquear un usuario
   * POST /blocked-users
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBlockedUserDto: CreateBlockedUserDto) {
    return this.blockedUsersService.create(createBlockedUserDto);
  }

  /**
   * Desbloquear un usuario
   * PATCH /blocked-users/unblock/:userId
   */
  @Patch('unblock/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async unblock(@Param('userId', ParseIntPipe) userId: number) {
    return this.blockedUsersService.unblock(userId);
  }

  /**
   * Expirar bloqueos antiguos
   * PATCH /blocked-users/expire-old?days=30
   */
  @Patch('expire-old')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async expireOldBlocks(@Query('days') days?: string) {
    return this.blockedUsersService.expireOldBlocks(days ? parseInt(days) : 30);
  }

  /**
   * Actualizar un bloqueo
   * PUT /blocked-users/:id
   */
  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlockedUserDto: UpdateBlockedUserDto,
  ) {
    return this.blockedUsersService.update(id, updateBlockedUserDto);
  }

  /**
   * Eliminar un bloqueo
   * DELETE /blocked-users/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.blockedUsersService.remove(id);
  }
}