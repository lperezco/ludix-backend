import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { ExerciseHistory } from '../exercise-history/entities/exercise-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExerciseType, Favorite, ExerciseHistory])],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}