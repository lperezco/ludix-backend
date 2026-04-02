import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserType } from '../user-types/entities/user-type.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserType)
    private userTypeRepository: Repository<UserType>,
    private configService: ConfigService,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, userTypeId } = createUserDto;

    // Verificar si el email ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    // Verificar que el userType existe
    const userType = await this.userTypeRepository.findOne({
      where: { id: userTypeId },
    });
    if (!userType) {
      throw new BadRequestException(
        `Tipo de usuario con ID ${userTypeId} no existe`,
      );
    }

    // Hashear contraseña
    const saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS') ?? '10',
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = this.usersRepository.create({
      email,
      password: passwordHash,
      name,
      userTypeId,
    });

    return this.usersRepository.save(newUser);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['userType', 'profile'],
    });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: [
        'userType',
        'profile',
        'userAchievements',
        'userAchievements.achievement',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['userType', 'profile'],
      order: { id: 'ASC' },
    });
  }

  /**
   * Actualizar usuario
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se actualiza email, verificar que no exista otro
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(
          `El email ${updateUserDto.email} ya está registrado por otro usuario`,
        );
      }
    }

    // Si se actualiza userTypeId, verificar que existe
    if (updateUserDto.userTypeId) {
      const userType = await this.userTypeRepository.findOne({
        where: { id: updateUserDto.userTypeId },
      });
      if (!userType) {
        throw new BadRequestException(
          `Tipo de usuario con ID ${updateUserDto.userTypeId} no existe`,
        );
      }
    }

    // Si se actualiza contraseña, hashearla
    if (updateUserDto.password) {
      const saltRounds = parseInt(
        this.configService.get<string>('SALT_ROUNDS') ?? '10',
      );
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Actualizar
    await this.usersRepository.update(id, updateUserDto);
    
    return this.findById(id);
  }

  /**
   * Eliminar usuario (hard delete)
   */
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findById(id);
    
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return { 
      message: `Usuario ${user.name} (ID: ${id}) eliminado correctamente` 
    };
  }

  /**
   * Eliminación suave (soft delete) - Opcional
   * Requiere agregar deletedAt en la entidad
   */
  async softRemove(id: number): Promise<{ message: string }> {
    const user = await this.findById(id);
    
    // Si implementas soft delete con TypeORM
    // await this.usersRepository.softDelete(id);
    
    return { 
      message: `Usuario ${user.name} (ID: ${id}) eliminado (soft delete)` 
    };
  }
}