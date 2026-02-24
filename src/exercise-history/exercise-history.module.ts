import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseHistory } from './entities/exercise-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseHistory])],
  controllers: [],
  providers: [],
})
export class ExerciseHistoryModule {}