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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Controller('challenges')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.challengesService.findAll();
  }

  @Get('active')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  getActiveChallenges() {
    return this.challengesService.getActiveChallenges();
  }

  @Get('current')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  getCurrentChallenge() {
    return this.challengesService.getCurrentChallenge();
  }

  @Get('type/:exerciseTypeId')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findByType(@Param('exerciseTypeId', ParseIntPipe) exerciseTypeId: number) {
    return this.challengesService.findByType(exerciseTypeId);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.findById(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(createChallengeDto);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ) {
    return this.challengesService.update(id, updateChallengeDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.remove(id);
  }
}