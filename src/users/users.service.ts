import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { DatabaseService } from 'src/database/database.service';
import { buildUpdateFields } from 'src/common/utils/sql-builder.util';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}
  private async ensureNotAdmin(id: number, action: string) {
    const user = await this.findOne(id);
    if (user.role === 'admin') {
      throw new BadRequestException(`Admin users cannot be ${action}`);
    }
    return user;
  }

  private async ensureAtLeastOneAdmin(tenantId: number) {
    const adminCountQuery = `SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'admin'`;
    const result = await this.databaseService.query(adminCountQuery, [
      tenantId,
    ]);

    if (parseInt(result.rows[0].count) <= 1) {
      throw new BadRequestException(
        'Cannot change the role of the only administrator in this tenant',
      );
    }
  }
  async create(createUserDto: CreateUserDto) {
    const { tenantId, name, email, phone, status, password, role } =
      createUserDto;

    // Check if any user exists for this tenant
    const countQuery = `SELECT COUNT(*) FROM users WHERE tenant_id = $1`;
    const countResult = await this.databaseService.query(countQuery, [
      tenantId,
    ]);
    const userExists = parseInt(countResult.rows[0].count) > 0;

    const finalRole = userExists ? role || 'staff' : 'admin';

    const query = `
      INSERT INTO users (tenant_id, name, email, phone, status, password, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email
    `;

    await this.databaseService.query(query, [
      tenantId,
      name,
      email,
      phone,
      status || 'active',
      password, // Note: In a real app, hash this if created via admin too
      finalRole,
    ]);

    return { message: 'User created successfully' };
  }

  async findAll(query: any) {
    return paginate(this.databaseService, 'users', query, [
      'name',
      'email',
      'phone',
    ]);
  }

  async findOne(id: number) {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await this.databaseService.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // 1. If deactivating, ensure they aren't an admin
    if (updateUserDto.status === 'inactive') {
      await this.ensureNotAdmin(id, 'deactivated');
    }

    // 2. If changing role from admin, ensure they aren't the LAST admin
    if (
      user.role === 'admin' &&
      updateUserDto.role &&
      updateUserDto.role !== 'admin'
    ) {
      await this.ensureAtLeastOneAdmin(user.tenant_id);
    }

    const { fieldsString, values, nextIdx } = buildUpdateFields(updateUserDto);
    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id);
    const query = `UPDATE users SET ${fieldsString} WHERE id = $${nextIdx} RETURNING id`;
    const result = await this.databaseService.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} updated successfully` };
  }

  async updateRole(id: number, role: string) {
    const user = await this.findOne(id);

    // If current role is admin and trying to change to something else
    if (user.role === 'admin' && role !== 'admin') {
      await this.ensureAtLeastOneAdmin(user.tenant_id);
    }

    const query = `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, role`;
    await this.databaseService.query(query, [role, id]);

    return {
      message: `User role updated to ${role} successfully`,
    };
  }

  async remove(id: number) {
    await this.ensureNotAdmin(id, 'deleted');

    const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} removed successfully` };
  }
}
