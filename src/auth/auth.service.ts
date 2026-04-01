import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const result = Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== 'password'),
    ) as UserWithoutPassword;
    return result;
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.userType.type,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userType.type,
      },
    };
  }

  logout() {
    return { message: 'Logout exitoso (elimina el token del cliente)' };
  }
}
