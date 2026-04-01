import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No se requiere rol específico
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserWithoutPassword }>();
    const user = request.user; // El usuario viene del JwtStrategy (validate retornó el objeto User completo)

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    // El rol está en user.userType.type (según tu entidad User)
    const userRole = user.userType?.type;
    if (!userRole) {
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    const hasRole = requiredRoles.includes(userRole);
    if (!hasRole) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recurso',
      );
    }

    return true;
  }
}
