import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../enum/roles.enum';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    Roles(roles),
  );
}
