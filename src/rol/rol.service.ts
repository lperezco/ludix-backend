import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const existing = await this.rolRepository.findOne({
      where: { name: createRolDto.name },
    });
    if (existing) throw new ConflictException('Rol already exists');
    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find({
      relations: ['rolPermissions', 'rolPermissions.permission'],
    });
  }

  async findById(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: { id },
      relations: ['rolPermissions', 'rolPermissions.permission'],
    });
    if (!rol) throw new NotFoundException(`Rol with id ${id} not found`);
    return rol;
  }

  async findByName(name: string): Promise<Rol | null> {
    return this.rolRepository.findOne({
      where: { name },
      relations: ['rolPermissions', 'rolPermissions.permission'],
    });
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    await this.findById(id);
    await this.rolRepository.update(id, updateRolDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findById(id);
    if (rol.users && rol.users.length) {
      throw new ConflictException('Cannot delete rol with associated users');
    }
    await this.rolRepository.delete(id);
  }
}
