import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Challenge } from '../../challenges/entities/challenge.entity';
import { Report } from '../../reports/entities/report.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, (profile) => profile.posts)
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column()
  profileId: number;

  @ManyToOne(() => Challenge, (challenge) => challenge.posts)
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;

  @Column()
  challengeId: number;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  date: Date;

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];
}