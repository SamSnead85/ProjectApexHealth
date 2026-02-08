/**
 * Module Access Guard
 * Ensures the organization has the required module licensed before allowing API access.
 * Works with @RequireModule() decorator.
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MODULE_KEY } from '../decorators/require-module.decorator';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<string>(MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredModule) {
      return true; // No module requirement set
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // In production: lookup org's licensed modules from database/cache
    // For now, check a header or user property
    const licensedModules = user.licensedModules || request.headers['x-licensed-modules']?.split(',') || [];

    // System admins bypass module checks
    if (user.role === 'system_admin') {
      return true;
    }

    if (!licensedModules.includes(requiredModule)) {
      throw new ForbiddenException(
        `This feature requires the "${requiredModule}" module. Contact your administrator to enable it.`,
      );
    }

    return true;
  }
}
