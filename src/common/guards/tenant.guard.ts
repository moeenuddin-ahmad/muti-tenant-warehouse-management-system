import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../enum/roles.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // 1. Extract tenant_id from request (Param, Query, or Body)
    const tenantId =
      request.params.tenant_id ||
      request.query.tenant_id ||
      request.body.tenant_id ||
      request.params.id; // Sometimes the tenant ID is the main ID of the resource (e.g. /tenants/:id)

    // 2. Security Check: Tenant Isolation
    // If a tenant_id was provided in the request, it MUST match the user's tenant_id
    if (tenantId && +tenantId !== user.tenant_id) {
      throw new ForbiddenException(
        'You do not have access to this tenant data',
      );
    }

    return true;
  }
}
