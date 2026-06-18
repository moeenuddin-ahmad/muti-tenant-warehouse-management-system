import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegistrationDto, LoginDto } from './dto/auth.dto';

import { DatabaseService } from 'src/database/database.service';
import { JwtServices } from 'src/common/services/jwt.utls';
import { BcryptServices } from 'src/common/services/bcrypt.utils';
import { MailServices } from 'src/common/services/mail.utils';
import { TenantsService } from 'src/tenants/tenants.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtServices,
    private readonly bcryptService: BcryptServices,
    private readonly mailService: MailServices,
    private readonly tenantsService: TenantsService,
  ) { }

  async register(registrationDto: RegistrationDto) {
    const {
      tenantId,
      name,
      email,
      phone,
      status,
      password,
      role = 'staff',
    } = registrationDto;

    // 0. Ensure tenant exists
    await this.tenantsService.findOne(tenantId);

    // 1. Check if any user exists for this tenant
    const countQuery = `SELECT COUNT(*) FROM users WHERE tenant_id = $1`;
    const result = await this.databaseService.query(countQuery, [tenantId]);
    const userExists = parseInt(result.rows[0].count) > 0;

    let finalRole = role;
    if (!userExists) {
      finalRole = 'admin';
    }

    const hashedPassword = await this.bcryptService.hashPassword(password);

    const query = `
      INSERT INTO users (tenant_id, name, email, phone, status, password, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, name
    `;

    await this.databaseService.query(query, [
      tenantId,
      name,
      email,
      phone,
      status || 'active',
      hashedPassword,
      finalRole,
    ]);

    return {
      message: 'User registered successfully',
    };
  }

  async login(loginUserDto: LoginDto) {
    const query = `SELECT id, email, name, password, tenant_id, role FROM users WHERE email = $1`;
    const result = await this.databaseService.query(query, [
      loginUserDto.email,
    ]);

    if (!result.rows.length) {
      throw new NotFoundException('User not found');
    }

    const user = result.rows[0];
    const isPasswordValid = await this.bcryptService.comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { accessToken, refreshToken } = await this.jwtService.generateToken({
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role,
    });

    const updateRefreshTokenQuery = `UPDATE users SET refresh_token = $1 WHERE id = $2`;
    await this.databaseService.query(updateRefreshTokenQuery, [
      refreshToken,
      user.id,
    ]);

    return {
      meta: { accessToken, refreshToken },
      message: 'User logged in successfully',
    };
  }

  async me(id: number) {
    const query = `SELECT id, email, name, role FROM users WHERE id = $1`;
    const result = await this.databaseService.query(query, [id]);
    if (!result.rows.length) {
      throw new NotFoundException('User not found');
    }
    const user = result.rows[0];
    return {
      data: user,
      message: 'User fetched successfully',
    };
  }

  async forgetPassword(email: string) {
    const query = `SELECT id, email, name FROM users WHERE email = $1`;
    const result = await this.databaseService.query(query, [email]);

    if (!result.rows.length) {
      throw new NotFoundException('User not found');
    }
    const user = result.rows[0];

    const resetToken = await this.jwtService.generateResetToken({
      id: user.id,
      email: user.email,
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    const htmlContent = `
      <h1>Reset Your Password</h1>
      <p>Hello ${user.name},</p>
      <p>Please click the link below to reset your password. This link will expire in 10 seconds:</p>
      <a href="${resetLink}">Reset Password</a>
    `;

    await this.mailService.sendMail(
      user.email,
      'Reset Your Password',
      htmlContent,
    );

    return { message: 'Reset link sent to your email', resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.jwtService.verifyToken(token);
    if (!payload.email) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await this.bcryptService.hashPassword(newPassword);

    const query = `UPDATE users SET password = $1 WHERE email = $2`;
    await this.databaseService.query(query, [hashedPassword, payload.email]);

    return { message: 'Password reset successfully' };
  }

  async refresh(accessTokenDTO: string, refreshTokenDTO: string) {
    const query = `SELECT id, email, name, tenant_id, role, refresh_token FROM users WHERE id = $1`;
    try {
      // First, verify the access token
      const accessTokenPayload =
        await this.jwtService.verifyToken(accessTokenDTO);

      const result = await this.databaseService.query(query, [
        accessTokenPayload.id,
      ]);
      if (!result.rows.length) {
        throw new NotFoundException('User not found');
      }
      return {
        message: 'Access token is still valid',
      };
    } catch {
      const refreshTokenPayload =
        await this.jwtService.verifyToken(refreshTokenDTO);
      const result = await this.databaseService.query(query, [
        refreshTokenPayload.id,
      ]);
      if (!result.rows.length) {
        throw new NotFoundException('User not found');
      }
      const user = result.rows[0];

      // Security check: Match the stored refresh token to prevent reuse of old tokens
      if (user.refresh_token !== refreshTokenDTO) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken } = await this.jwtService.generateToken(
        {
          id: user.id,
          email: user.email,
          tenant_id: user.tenant_id,
          role: user.role,
        },
      );

      const refreshTokenQuery = `UPDATE users SET refresh_token = $1 WHERE id = $2`;
      await this.databaseService.query(refreshTokenQuery, [
        refreshToken,
        user.id,
      ]);

      return {
        meta: { accessToken, refreshToken },
        message: 'Tokens refreshed successfully',
      };
    }
  }
}
