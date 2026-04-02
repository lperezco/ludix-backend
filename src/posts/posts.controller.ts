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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Obtener todos los posts (con paginación y filtros)
   * GET /posts?page=1&limit=10&challengeId=1&profileId=1&startDate=2024-01-01&endDate=2024-12-31
   */
  @Get()
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('challengeId') challengeId?: string,
    @Query('profileId') profileId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.postsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      challengeId ? parseInt(challengeId) : undefined,
      profileId ? parseInt(profileId) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Buscar posts por contenido
   * GET /posts/search?q=contenido&page=1&limit=10
   */
  @Get('search')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async search(
    @Query('q') searchTerm: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.search(
      searchTerm,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Obtener posts recientes
   * GET /posts/recent?days=7
   */
  @Get('recent')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async findRecent(@Query('days') days?: string) {
    return this.postsService.findRecent(days ? parseInt(days) : 7);
  }

  /**
   * Obtener posts populares
   * GET /posts/popular?limit=10
   */
  @Get('popular')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async getPopular(@Query('limit') limit?: string) {
    return this.postsService.getPopular(limit ? parseInt(limit) : 10);
  }

  /**
   * Obtener estadísticas de posts
   * GET /posts/stats
   */
  @Get('stats')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.postsService.getStats();
  }

  /**
   * Obtener posts por perfil
   * GET /posts/profile/:profileId
   */
  @Get('profile/:profileId')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async findByProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findByProfile(
      profileId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Obtener posts por challenge
   * GET /posts/challenge/:challengeId
   */
  @Get('challenge/:challengeId')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async findByChallenge(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findByChallenge(
      challengeId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * Obtener un post por ID
   * GET /posts/:id
   */
  @Get(':id')
  @Roles('admin', 'moderator', 'user')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findById(id);
  }

  /**
   * Crear un nuevo post
   * POST /posts
   */
  @Post()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  /**
   * Actualizar un post
   * PUT /posts/:id
   */
  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  /**
   * Eliminar un post
   * DELETE /posts/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  /**
   * Eliminar todos los posts de un perfil
   * DELETE /posts/profile/:profileId
   */
  @Delete('profile/:profileId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeByProfile(@Param('profileId', ParseIntPipe) profileId: number) {
    return this.postsService.removeByProfile(profileId);
  }
}