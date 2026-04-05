import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('exercise_types')
export class ExerciseType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Exercise, (exercise) => exercise.exerciseType)
  exercises: Exercise[];
}
