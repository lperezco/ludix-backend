import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.permissions) throw new ForbiddenException('No permissions assigned');

    const hasAll = requiredPermissions.every(permission => user.permissions.includes(permission));
    if (!hasAll) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
