import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolPermission } from './entities/rol-permission.entity';
import { CreateRolPermissionDto } from './dto/create-rol-permission.dto';
import { UpdateRolPermissionDto } from './dto/update-rol-permission.dto';
import { RolService } from '../rol/rol.service';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolPermissionsService {
  constructor(
    @InjectRepository(RolPermission)
    private rolPermissionRepository: Repository<RolPermission>,
    private rolService: RolService,
    private permissionService: PermissionsService,
  ) {}

  async create(createDto: CreateRolPermissionDto): Promise<RolPermission> {
    // Verificar que rol y permiso existen (usando los servicios existentes)
    await this.rolService.findById(createDto.rolId);
    await this.permissionService.findById(createDto.permissionId);

    // Verificar si ya existe la asignación
    const existing = await this.rolPermissionRepository.findOne({
      where: { rolId: createDto.rolId, permissionId: createDto.permissionId },
    });
    if (existing) {
      throw new ConflictException('Este permiso ya está asignado al rol');
    }

    const entity = this.rolPermissionRepository.create(createDto);
    return this.rolPermissionRepository.save(entity);
  }

  async findAll(): Promise<RolPermission[]> {
    // Sin relaciones para evitar errores (solo los datos básicos)
    return this.rolPermissionRepository.find();
  }

  async findById(id: number): Promise<RolPermission> {
    const entity = await this.rolPermissionRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`RolPermission con id ${id} no encontrado`);
    }
    return entity;
  }

  async findByRol(rolId: number): Promise<RolPermission[]> {
    // Verificar que el rol existe
    await this.rolService.findById(rolId);
    return this.rolPermissionRepository.find({
      where: { rolId },
    });
  }

  async update(
    id: number,
    updateDto: UpdateRolPermissionDto,
  ): Promise<RolPermission> {
    await this.findById(id);
    if (updateDto.rolId) {
      await this.rolService.findById(updateDto.rolId);
    }
    if (updateDto.permissionId) {
      await this.permissionService.findById(updateDto.permissionId);
    }
    await this.rolPermissionRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const entity = await this.findById(id);
    await this.rolPermissionRepository.delete(id);
    return {
      message: `Asignación de permiso a rol (id ${entity.id}) eliminada correctamente`,
    };
  }

  async removeByRol(rolId: number): Promise<{ message: string }> {
    const result = await this.rolPermissionRepository.delete({ rolId });
    return {
      message: `Se eliminaron ${result.affected} asignaciones de permisos para el rol ${rolId}`,
    };
  }
}
