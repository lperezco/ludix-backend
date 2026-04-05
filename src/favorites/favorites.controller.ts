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
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.favoritesService.findAll();
  }

  @Get('user/:userId')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.favoritesService.findByUser(userId);
  }

  @Get('exercise/:exerciseId')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  findByExercise(@Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.favoritesService.findByExercise(exerciseId);
  }

  @Get('check/:userId/:exerciseId')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  async checkFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(
      userId,
      exerciseId,
    );
    return { userId, exerciseId, isFavorite };
  }

  @Get(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.favoritesService.findById(id);
  }

  @Post()
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Patch('toggle/:userId/:exerciseId')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  toggleFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.favoritesService.toggleFavorite(userId, exerciseId);
  }

  @Put(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(id, updateFavoriteDto);
  }

  @Delete(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.favoritesService.remove(id);
  }

  @Delete('user/:userId/exercise/:exerciseId')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  removeByUserAndExercise(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.favoritesService.removeByUserAndExercise(userId, exerciseId);
  }
}
