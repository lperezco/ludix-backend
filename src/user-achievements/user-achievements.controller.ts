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
import { UserAchievementsService } from './user-achievements.service';
import { CreateUserAchievementDto } from './dto/create-user-achievement.dto';
import { UpdateUserAchievementDto } from './dto/update-user-achievement.dto';

@Controller('user-achievements')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserAchievementsController {
  constructor(private readonly service: UserAchievementsService) {}

  @Get()
  @Permissions('admin')
  findAll() {
    return this.service.findAll();
  }

  @Get('user/:userId')
  @Permissions('admin', 'user')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUser(userId);
  }

  @Get('achievement/:achievementId')
  @Permissions('admin')
  findByAchievement(
    @Param('achievementId', ParseIntPipe) achievementId: number,
  ) {
    return this.service.findByAchievement(achievementId);
  }

  @Get('check/:userId/:achievementId')
  @Permissions('admin', 'user')
  async checkAchievement(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('achievementId', ParseIntPipe) achievementId: number,
  ) {
    const has = await this.service.hasAchievement(userId, achievementId);
    return { userId, achievementId, has };
  }

  @Get(':id')
  @Permissions('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @Permissions('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserAchievementDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserAchievementDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Delete('user/:userId')
  @Permissions('admin')
  removeAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.removeAllByUser(userId);
  }
}
