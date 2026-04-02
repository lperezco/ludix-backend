import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserAchievement } from '../../user-achievements/entities/user-achievement.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  requirement: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  points: number;

  @OneToMany(() => UserAchievement, (ua) => ua.achievement)
  userAchievements: UserAchievement[];
}