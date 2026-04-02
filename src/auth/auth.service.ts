import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Validar credenciales del usuario
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Remover password del objeto retornado
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Login - generar token JWT
   */
  async login(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name,
      userTypeId: user.userTypeId,
      userType: user.userType?.type || 'user'
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userTypeId: user.userTypeId,
        userType: user.userType?.type || 'user',
      },
    };
  }

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: {
    email: string;
    password: string;
    name: string;
    userTypeId?: number;
  }) {
    const { email, password, name, userTypeId = 2 } = registerDto; // Por defecto 'user' (ID 2)

    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Crear el usuario (el servicio ya hashea la contraseña)
    const newUser = await this.usersService.create({
      email,
      password,
      name,
      userTypeId,
    });

    // Retornar token
    return this.login(newUser);
  }

  /**
   * Verificar token
   */
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return { valid: true, user };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
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