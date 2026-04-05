import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createDto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing) throw new ConflictException('Permission already exists');
    const permission = this.permissionRepository.create(createDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission)
      throw new NotFoundException(`Permission with id ${id} not found`);
    return permission;
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  async update(
    id: number,
    updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    await this.findById(id);
    await this.permissionRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.permissionRepository.delete(id);
  }
}
