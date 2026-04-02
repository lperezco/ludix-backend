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
import { ExerciseTypesService } from './exercise-types.service';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';

@Controller('exercise-types')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExerciseTypesController {
  constructor(private readonly exerciseTypesService: ExerciseTypesService) {}

  @Get()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.exerciseTypesService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseTypesService.findById(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExerciseTypeDto: CreateExerciseTypeDto) {
    return this.exerciseTypesService.create(createExerciseTypeDto);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseTypeDto: UpdateExerciseTypeDto,
  ) {
    return this.exerciseTypesService.update(id, updateExerciseTypeDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseTypesService.remove(id);
  }
}