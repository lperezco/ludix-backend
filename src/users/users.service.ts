import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, userTypeId } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    const userType = await this.userTypeRepository.findOne({
      where: { id: userTypeId },
    });
    if (!userType) {
      throw new BadRequestException(`Tipo de usuario con ID ${userTypeId} no existe`);
    }

    const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS') ?? '10');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      email,
      password: passwordHash,
      name,
      userTypeId,
    });

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['userType', 'profile'],
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['userType', 'profile', 'userAchievements', 'userAchievements.achievement'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['userType'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(`El email ${updateUserDto.email} ya está registrado`);
      }
    }

    if (updateUserDto.userTypeId && updateUserDto.userTypeId !== user.userTypeId) {
      const userType = await this.userTypeRepository.findOne({
        where: { id: updateUserDto.userTypeId },
      });
      if (!userType) {
        throw new BadRequestException(`Tipo de usuario con ID ${updateUserDto.userTypeId} no existe`);
      }
    }

    if (updateUserDto.password) {
      const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS') ?? '10');
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
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