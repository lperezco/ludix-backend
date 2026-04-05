import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Comment, (comment) => comment.reports)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;
  @Column()
  commentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedBy' })
  reportedByUser: User;
  @Column()
  reportedBy: number;

  @Column('text')
  reason: string;

  @Column({ default: 'pending' })
  status: string; // pending, reviewing, approved, rejected

  @CreateDateColumn()
  createdAt: Date;
}
