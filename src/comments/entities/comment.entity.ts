import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Report } from '../../reports/entities/report.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  userId: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.comments)
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;
  @Column()
  exerciseId: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: Comment;
  @Column({ nullable: true })
  parentCommentId: number;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @OneToMany(() => Report, (report) => report.comment)
  reports: Report[];
}
