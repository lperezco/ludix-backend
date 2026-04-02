import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'ludix-secret-key',
    });
  }

  async validate(payload: any) {
    // payload contiene los datos que se pusieron en el token
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Retornar los datos del usuario que se adjuntarán al request
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userTypeId: user.userTypeId,
      userType: user.userType?.type || 'user',
      roles: [user.userType?.type || 'user'], // Para RolesGuard
    };
  }
}