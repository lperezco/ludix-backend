import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ExerciseType } from '../../exercise-types/entities/exercise-type.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { ExerciseHistory } from '../../exercise-history/entities/exercise-history.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  duration: number;

  @ManyToOne(() => ExerciseType, (exerciseType) => exerciseType.exercises)
  @JoinColumn({ name: 'exerciseTypeId' })
  exerciseType: ExerciseType;

  @Column()
  exerciseTypeId: number;

  @Column({ nullable: true })
  createdBy: string;

  @OneToMany(() => Favorite, (fav) => fav.exercise)
  favorites: Favorite[];

  @OneToMany(() => ExerciseHistory, (eh) => eh.exercise)
  histories: ExerciseHistory[];
}