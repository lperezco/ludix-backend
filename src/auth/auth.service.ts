import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './dto/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Cargar usuario con permisos (true)
    const user = await this.usersService.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const { password: result } = user;
    return result;
  }

  login(user: any) {
    const permissions =
      user.rol?.rolPermissions?.map((rp) => rp.permission.name) || [];
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      rolId: user.rolId,
      rol: user.rol?.name,
      permissions,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rolId: user.rolId,
        rol: user.rol?.name,
        permissions,
      },
    };
  }

  async register(registerDto: {
    email: string;
    password: string;
    name: string;
    rolId?: number;
  }) {
    const { email, password, name, rolId = 2 } = registerDto; // rol user por defecto id=2
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }
    const newUser = await this.usersService.create({
      email,
      password,
      name,
      rolId,
    });
    return this.login(newUser);
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return { valid: true, user };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.update(userId, { password: newHashedPassword });
    return { message: 'Contraseña actualizada correctamente' };
  }
}
