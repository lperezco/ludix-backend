import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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

  async create(createUserTypeDto: CreateUserTypeDto): Promise<UserType> {
    const { type } = createUserTypeDto;

    const existing = await this.userTypeRepository.findOne({
      where: { type },
    });
    if (existing) {
      throw new ConflictException(`El tipo de usuario "${type}" ya existe`);
    }

    const userType = this.userTypeRepository.create(createUserTypeDto);
    return await this.userTypeRepository.save(userType);
  }

  async findAll(): Promise<UserType[]> {
    return await this.userTypeRepository.find({
      relations: ['users'],
      order: { type: 'ASC' },
    });
  }

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

  async findByType(type: string): Promise<UserType> {
    const userType = await this.userTypeRepository.findOne({
      where: { type },
    });
    if (!userType) {
      throw new NotFoundException(`Tipo de usuario "${type}" no encontrado`);
    }
    return userType;
  }

  async update(id: number, updateUserTypeDto: UpdateUserTypeDto): Promise<UserType> {
    const userType = await this.findById(id);

    if (updateUserTypeDto.type && updateUserTypeDto.type !== userType.type) {
      const existing = await this.userTypeRepository.findOne({
        where: { type: updateUserTypeDto.type },
      });
      if (existing) {
        throw new ConflictException(`El tipo de usuario "${updateUserTypeDto.type}" ya existe`);
      }
    }

    await this.userTypeRepository.update(id, updateUserTypeDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const userType = await this.findById(id);

    if (userType.users && userType.users.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el tipo "${userType.type}" porque tiene ${userType.users.length} usuarios asociados`,
      );
    }

    await this.userTypeRepository.delete(id);
    return {
      message: `Tipo de usuario "${userType.type}" eliminado correctamente`,
    };
  }
}