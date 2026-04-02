import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from './entities/user-type.entity';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';

@Injectable()
export class UserTypesService {
  constructor(
    @InjectRepository(UserType)
    private userTypeRepository: Repository<UserType>,
  ) {}

  /**
   * Crear un nuevo tipo de usuario
   */
  async create(createUserTypeDto: CreateUserTypeDto): Promise<UserType> {
    const { type } = createUserTypeDto;

    // Verificar si ya existe un tipo con ese nombre
    const existingType = await this.userTypeRepository.findOne({
      where: { type },
    });

    if (existingType) {
      throw new ConflictException(`El tipo de usuario '${type}' ya existe`);
    }

    // Crear el nuevo tipo
    const userType = this.userTypeRepository.create(createUserTypeDto);
    return await this.userTypeRepository.save(userType);
  }

  /**
   * Obtener todos los tipos de usuario
   */
  async findAll(): Promise<UserType[]> {
    return await this.userTypeRepository.find({
      relations: ['users'],
      order: { id: 'ASC' },
    });
  }

  /**
   * Obtener un tipo de usuario por ID
   */
  async findById(id: number): Promise<UserType> {
    const userType = await this.userTypeRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!userType) {
      throw new NotFoundException(`Tipo de usuario con ID ${id} no encontrado`);
    }

    return userType;
  }

  /**
   * Obtener un tipo de usuario por nombre
   */
  async findByType(type: string): Promise<UserType | null> {
    return await this.userTypeRepository.findOne({
      where: { type },
    });
  }

  /**
   * Actualizar un tipo de usuario
   */
  async update(id: number, updateUserTypeDto: UpdateUserTypeDto): Promise<UserType> {
    // Verificar que existe
    const userType = await this.findById(id);

    // Si se actualiza el tipo, verificar que no exista otro con ese nombre
    if (updateUserTypeDto.type && updateUserTypeDto.type !== userType.type) {
      const existingType = await this.userTypeRepository.findOne({
        where: { type: updateUserTypeDto.type },
      });
      if (existingType) {
        throw new ConflictException(
          `El tipo de usuario '${updateUserTypeDto.type}' ya existe`,
        );
      }
    }

    // Actualizar
    await this.userTypeRepository.update(id, updateUserTypeDto);
    
    return this.findById(id);
  }

  /**
   * Eliminar un tipo de usuario
   */
  async remove(id: number): Promise<{ message: string }> {
    const userType = await this.findById(id);

    // Verificar si hay usuarios usando este tipo
    if (userType.users && userType.users.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el tipo '${userType.type}' porque tiene ${userType.users.length} usuarios asociados`,
      );
    }

    const result = await this.userTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tipo de usuario con ID ${id} no encontrado`);
    }

    return {
      message: `Tipo de usuario '${userType.type}' (ID: ${id}) eliminado correctamente`,
    };
  }
}