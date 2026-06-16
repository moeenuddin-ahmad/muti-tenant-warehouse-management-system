import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtServices } from 'src/common/services/jwt.utls';
import { Request } from 'express';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtServices,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyToken(token);
      if (!payload.id) {
        throw new UnauthorizedException();
      }
      const query = `SELECT id, email, name, tenant_id, role FROM users WHERE id = $1`;
      const result = await this.databaseService.query(query, [payload.id]);
      if (!result.rows.length) {
        throw new UnauthorizedException();
      }
      request['user'] = result.rows[0];
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
