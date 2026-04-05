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
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Controller('exercises')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get('type/:exerciseTypeId')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findByType(@Param('exerciseTypeId', ParseIntPipe) exerciseTypeId: number) {
    return this.exercisesService.findByType(exerciseTypeId);
  }

  @Get(':id')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.findById(id);
  }

  @Post()
  @Permissions('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Put(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.remove(id);
  }
}
