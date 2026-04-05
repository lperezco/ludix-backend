import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolPermission } from '../../rol-permissions/entities/rol-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RolPermission, (rp) => rp.permission)
  rolPermissions: RolPermission[];
}
