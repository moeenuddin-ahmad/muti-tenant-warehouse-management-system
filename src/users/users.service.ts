import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/users.dto';
import { DatabaseService } from 'src/database/database.service';
import { buildUpdateFields } from 'src/common/utils/sql-builder.util';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async ensureNotAdmin(tenant_id: number, id: number, action: string) {
    const user = await this.findOne(tenant_id, id);
    if (user.role === 'admin') {
      throw new BadRequestException(`Admin users cannot be ${action}`);
    }
    return user;
  }

  private async ensureAtLeastOneAdmin(tenantId: number) {
    const result = await this.databaseService.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'admin'`,
      [tenantId],
    );
    if (parseInt(result.rows[0].count) <= 1) {
      throw new BadRequestException(
        'Cannot change the role of the only administrator in this tenant',
      );
    }
  }

  async findAll(tenant_id: number, query: any) {
    return paginate(
      this.databaseService,
      'users',
      query,
      ['name', 'email', 'phone'],
      {
        tenant_id,
      },
    );
  }

  async findOne(tenant_id: number, id: number) {
    const result = await this.databaseService.query(
      'SELECT * FROM users WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(tenant_id: number, id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(tenant_id, id);

    // If deactivating, ensure they aren't an admin
    if (updateUserDto.status === 'inactive') {
      await this.ensureNotAdmin(tenant_id, id, 'deactivated');
    }

    // If changing role away from admin, ensure not the last admin
    if (
      user.role === 'admin' &&
      updateUserDto.role &&
      updateUserDto.role !== 'admin'
    ) {
      await this.ensureAtLeastOneAdmin(tenant_id);
    }

    const { fieldsString, values, nextIdx } = buildUpdateFields(updateUserDto);
    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE users SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.databaseService.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} updated successfully` };
  }

  async updateRole(tenant_id: number, id: number, role: string) {
    const user = await this.findOne(tenant_id, id);

    if (user.role === 'admin' && role !== 'admin') {
      await this.ensureAtLeastOneAdmin(tenant_id);
    }

    await this.databaseService.query(
      'UPDATE users SET role = $1 WHERE id = $2 AND tenant_id = $3',
      [role, id, tenant_id],
    );

    return { message: `User role updated to ${role} successfully` };
  }

  async remove(tenant_id: number, id: number) {
    await this.ensureNotAdmin(tenant_id, id, 'deleted');

    const result = await this.databaseService.query(
      'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} removed successfully` };
  }
}
