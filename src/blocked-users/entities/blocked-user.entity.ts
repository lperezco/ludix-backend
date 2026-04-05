import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('blocked_users')
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.blockedRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blockedBy' })
  blockedByUser: User;

  @Column()
  blockedBy: number;

  @Column('text')
  reason: string;

  @Column({ type: 'date' })
  blockedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
