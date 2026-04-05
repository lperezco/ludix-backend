import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Rol } from '../../rol/entities/rol.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('rol_permissions')
export class RolPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rol, (rol) => rol.rolPermissions)
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @Column()
  rolId: number;

  @ManyToOne(() => Permission, (permission) => permission.rolPermissions)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @Column()
  permissionId: number;
}
