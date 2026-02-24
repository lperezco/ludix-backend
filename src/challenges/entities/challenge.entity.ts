import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ExerciseType } from '../../exercise-types/entities/exercise-type.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => ExerciseType, (exerciseType) => exerciseType.challenges)
  @JoinColumn({ name: 'exerciseTypeId' })
  exerciseType: ExerciseType;

  @Column()
  exerciseTypeId: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column()
  createdBy: number;

  @OneToMany(() => Post, (post) => post.challenge)
  posts: Post[];
}