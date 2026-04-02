import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Challenge } from '../../challenges/entities/challenge.entity';

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

  @OneToMany(() => Challenge, (challenge) => challenge.exerciseType)
  challenges: Challenge[];
}