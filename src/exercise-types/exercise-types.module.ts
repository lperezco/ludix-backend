import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseType } from './entities/exercise-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseType])],
  controllers: [],
  providers: [],
})
export class ExerciseTypesModule {}