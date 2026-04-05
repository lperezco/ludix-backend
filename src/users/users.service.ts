import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Rol } from '../rol/entities/rol.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, rolId } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    const rol = await this.rolRepository.findOne({
      where: { id: rolId },
    });
    if (!rol) {
      throw new BadRequestException(`Rol con ID ${rolId} no existe`);
    }

    const saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS') ?? '10',
      10,
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      email,
      password: passwordHash,
      name,
      rolId,
    });

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: [
        'rol',
        'profile',
        'userAchievements',
        'userAchievements.achievement',
      ],
      order: { id: 'ASC' },
    });
  }

  async findById(id: number, loadPermissions: boolean = false): Promise<User> {
    const relations = ['rol'];
    if (loadPermissions) {
      relations.push('rol.rolPermissions', 'rol.rolPermissions.permission');
    }
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: relations as any, // TypeORM permite array de strings
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(
    email: string,
    loadPermissions: boolean = false,
  ): Promise<User | null> {
    const relations = ['rol'];
    if (loadPermissions) {
      relations.push('rol.rolPermissions', 'rol.rolPermissions.permission');
    }
    return this.usersRepository.findOne({
      where: { email },
      relations: relations as any,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(
          `El email ${updateUserDto.email} ya está registrado`,
        );
      }
    }

    if (updateUserDto.rolId && updateUserDto.rolId !== user.rolId) {
      const rol = await this.rolRepository.findOne({
        where: { id: updateUserDto.rolId },
      });
      if (!rol) {
        throw new BadRequestException(
          `Rol con ID ${updateUserDto.rolId} no existe`,
        );
      }
    }

    if (updateUserDto.password) {
      const saltRounds = parseInt(
        this.configService.get<string>('SALT_ROUNDS') ?? '10',
        10,
      );
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findById(id);
    await this.usersRepository.delete(id);
    return {
      message: `Usuario ${user.name} (ID: ${id}) eliminado correctamente`,
    };
  }
}
