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
import { ExerciseTypesService } from './exercise-types.service';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';

@Controller('exercise-types')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExerciseTypesController {
  constructor(private readonly exerciseTypesService: ExerciseTypesService) {}

  @Get()
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.exerciseTypesService.findAll();
  }

  @Get(':id')
  @Permissions('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseTypesService.findById(id);
  }

  @Post()
  @Permissions('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExerciseTypeDto: CreateExerciseTypeDto) {
    return this.exerciseTypesService.create(createExerciseTypeDto);
  }

  @Put(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseTypeDto: UpdateExerciseTypeDto,
  ) {
    return this.exerciseTypesService.update(id, updateExerciseTypeDto);
  }

  @Delete(':id')
  @Permissions('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseTypesService.remove(id);
  }
}
