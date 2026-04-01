import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserType } from '../user-types/entities/user-type.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserType)
    private userTypeRepository: Repository<UserType>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: {
    email: string;
    password: string;
    name: string;
    userTypeId: number;
  }): Promise<User> {
    const { email, password, name, userTypeId } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const userType = await this.userTypeRepository.findOne({
      where: { id: userTypeId },
    });
    if (!userType) {
      throw new BadRequestException('Tipo de usuario no válido');
    }

    const saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS') ?? '10',
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      email,
      password: passwordHash,
      name,
      userTypeId,
    });

    return this.usersRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['userType'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['userType'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['userType'],
    });
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
