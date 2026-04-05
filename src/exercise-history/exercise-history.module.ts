import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseHistory } from './entities/exercise-history.entity';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistoryController } from './exercise-history.controller';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseHistory, User, Exercise])],
  controllers: [ExerciseHistoryController],
  providers: [ExerciseHistoryService],
  exports: [ExerciseHistoryService],
})
export class ExerciseHistoryModule {}
