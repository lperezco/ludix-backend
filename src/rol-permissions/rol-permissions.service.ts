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
    await this.rolService.findById(createDto.rolId);
    await this.permissionService.findById(createDto.permissionId);

    const existing = await this.rolPermissionRepository.findOne({
      where: { rolId: createDto.rolId, permissionId: createDto.permissionId },
    });
    if (existing)
      throw new ConflictException(
        'This permission is already assigned to the rol',
      );

    const entity = this.rolPermissionRepository.create(createDto);
    return this.rolPermissionRepository.save(entity);
  }

  async findAll(): Promise<RolPermission[]> {
    return this.rolPermissionRepository.find({
      relations: ['rol', 'permission'],
    });
  }

  async findById(id: number): Promise<RolPermission> {
    const entity = await this.rolPermissionRepository.findOne({
      where: { id },
      relations: ['rol', 'permission'],
    });
    if (!entity)
      throw new NotFoundException(`RolPermission with id ${id} not found`);
    return entity;
  }

  async findByRol(rolId: number): Promise<RolPermission[]> {
    return this.rolPermissionRepository.find({
      where: { rolId },
      relations: ['permission'],
    });
  }

  async update(
    id: number,
    updateDto: UpdateRolPermissionDto,
  ): Promise<RolPermission> {
    await this.findById(id);
    if (updateDto.rolId) await this.rolService.findById(updateDto.rolId);
    if (updateDto.permissionId)
      await this.permissionService.findById(updateDto.permissionId);
    await this.rolPermissionRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.rolPermissionRepository.delete(id);
  }

  async removeByRol(rolId: number): Promise<void> {
    await this.rolPermissionRepository.delete({ rolId });
  }
}
