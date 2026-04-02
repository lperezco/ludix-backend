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
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * Obtener todos los perfiles
   * GET /profiles
   */
  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.profilesService.findAll();
  }

  /**
   * Buscar perfiles por término
   * GET /profiles/search?q=nombre
   */
  @Get('search')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  async search(@Query('q') searchTerm: string) {
    return this.profilesService.search(searchTerm);
  }

  /**
   * Obtener estadísticas de perfiles
   * GET /profiles/stats
   */
  @Get('stats')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.profilesService.getStats();
  }

  /**
   * Obtener perfiles por área creativa
   * GET /profiles/creative-area/:creativeAreaId
   */
  @Get('creative-area/:creativeAreaId')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  async findByCreativeArea(@Param('creativeAreaId', ParseIntPipe) creativeAreaId: number) {
    return this.profilesService.findByCreativeArea(creativeAreaId);
  }

  /**
   * Obtener perfil por userId (para el propio usuario o admin)
   * GET /profiles/user/:userId
   */
  @Get('user/:userId')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.profilesService.findByUserId(userId);
  }

  /**
   * Obtener perfil por ID
   * GET /profiles/:id
   */
  @Get(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findById(id);
  }

  /**
   * Crear un nuevo perfil (solo admin)
   * POST /profiles
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  /**
   * Actualizar un perfil por ID (solo admin)
   * PUT /profiles/:id
   */
  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  /**
   * Actualizar mi propio perfil (para usuarios autenticados)
   * PUT /profiles/me
   */
  @Put('me')
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    // Aquí normalmente tendrías @CurrentUser() para obtener el ID del usuario autenticado
  ) {
    // Por ahora asumimos que el userId viene del token JWT
    // const userId = currentUser.id;
    const userId = 1; // 👈 Reemplazar con el ID del usuario autenticado
    return this.profilesService.updateByUserId(userId, updateProfileDto);
  }

  /**
   * Eliminar un perfil (solo admin)
   * DELETE /profiles/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}