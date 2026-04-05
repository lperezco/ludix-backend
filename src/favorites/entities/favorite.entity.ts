import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.favorites)
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column()
  exerciseId: number;

  @CreateDateColumn()
  createdAt: Date;
}
