import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      this.logger.debug('Nenhuma role requerida, permitindo acesso');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.debug(`[RolesGuard] User: ${JSON.stringify(user)}`);
    this.logger.debug(`[RolesGuard] Required Roles: ${requiredRoles}`);

    // Validação: user existe?
    if (!user) {
      this.logger.error('User não encontrado no request');
      throw new ForbiddenException('User não autenticado');
    }

    // Validação: user.role existe?
    if (!user.role) {
      this.logger.error('User não possui role definida');
      throw new ForbiddenException('User sem role');
    }

    // Normalizar role do usuário: UPPERCASE + trim
    const normalizedUserRole = user.role.toString().toUpperCase().trim();
    
    this.logger.debug(`[RolesGuard] User role normalizada: ${normalizedUserRole}`);
    this.logger.debug(`[RolesGuard] Tipo de role: ${typeof user.role}`);

    // Comparar com roles requeridas (normalizadas também)
    const hasRole = requiredRoles.some(role => 
      role.toUpperCase().trim() === normalizedUserRole
    );

    if (!hasRole) {
      this.logger.warn(`Acesso negado. User role: ${normalizedUserRole}, Required: ${requiredRoles}`);
      throw new ForbiddenException('Permissão insuficiente');
    }

    this.logger.debug(`Acesso concedido para role: ${normalizedUserRole}`);
    return true;
  }
}
