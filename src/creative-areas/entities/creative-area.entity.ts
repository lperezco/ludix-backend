import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('creative_areas')
export class CreativeArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  area: string;

  @OneToMany(() => Profile, (profile) => profile.creativeArea)
  profiles: Profile[];
}