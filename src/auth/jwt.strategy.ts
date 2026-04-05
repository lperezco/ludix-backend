import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './dto/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'ludix-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // Cargar usuario con permisos (relaciones)
    const user = await this.usersService.findById(payload.sub, true);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Extraer permisos desde la relación rol -> rolPermissions -> permission
    const permissions =
      user.rol?.rolPermissions?.map((rp) => rp.permission.name) || [];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      rolId: user.rolId,
      rol: user.rol?.name,
      permissions,
    };
  }
}
