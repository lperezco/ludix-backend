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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Controller('achievements')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @Permissions('read_achievement') // permiso para ver logros
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.achievementsService.findAll();
  }

  @Get(':id')
  @Permissions('read_achievement')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.achievementsService.findById(id);
  }

  @Post()
  @Permissions('create_achievement')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAchievementDto: CreateAchievementDto) {
    return this.achievementsService.create(createAchievementDto);
  }

  @Put(':id')
  @Permissions('update_achievement')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {
    return this.achievementsService.update(id, updateAchievementDto);
  }

  @Delete(':id')
  @Permissions('delete_achievement')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.achievementsService.remove(id);
  }
}
