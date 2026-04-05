import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RolPermission } from '../../rol-permissions/entities/rol-permission.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 'admin', 'user'

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.rol)
  users: User[];

  @OneToMany(() => RolPermission, (rp) => rp.rol)
  rolPermissions: RolPermission[];
}
