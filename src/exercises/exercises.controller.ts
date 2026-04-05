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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('exercises')
@Controller('exercises')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @Permissions('view_exercises')
  @ApiOperation({ summary: 'Obtener todos los ejercicios' })
  @ApiResponse({ status: 200, description: 'Lista de ejercicios' })
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get('type/:exerciseTypeId')
  @Permissions('view_exercises')
  @ApiOperation({ summary: 'Obtener ejercicios por tipo' })
  findByType(@Param('exerciseTypeId', ParseIntPipe) exerciseTypeId: number) {
    return this.exercisesService.findByType(exerciseTypeId);
  }

  @Get(':id')
  @Permissions('view_exercises')
  @ApiOperation({ summary: 'Obtener ejercicio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.findById(id);
  }

  @Post()
  @Permissions('create_exercise')
  @ApiOperation({ summary: 'Crear ejercicio', description: 'Requiere permisos de administrador' })
  @ApiResponse({ status: 201, description: 'Ejercicio creado' })
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Put(':id')
  @Permissions('edit_exercise')
  @ApiOperation({ summary: 'Actualizar ejercicio' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExerciseDto: UpdateExerciseDto) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @Permissions('delete_exercise')
  @ApiOperation({ summary: 'Eliminar ejercicio' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.remove(id);
  }
}
