import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CreativeArea } from '../../creative-areas/entities/creative-area.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => CreativeArea, (creativeArea) => creativeArea.profiles)
  @JoinColumn({ name: 'creativeAreaId' })
  creativeArea: CreativeArea;

  @Column()
  creativeAreaId: number;

  @OneToMany(() => Post, (post) => post.profile)
  posts: Post[];
}
