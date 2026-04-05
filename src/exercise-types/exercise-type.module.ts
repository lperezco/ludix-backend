import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseType } from './entities/exercise-type.entity';
import { ExerciseTypesService } from './exercise-types.service';
import { ExerciseTypesController } from './exercise-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseType])],
  controllers: [ExerciseTypesController],
  providers: [ExerciseTypesService],
  exports: [ExerciseTypesService],
})
export class ExerciseTypesModule {}
