import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_types')
export class UserType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: string; // 'admin' o 'user'

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.userType)
  users: User[];
}