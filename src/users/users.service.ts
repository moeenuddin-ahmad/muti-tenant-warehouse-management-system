import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { DatabaseService } from 'src/database/database.service';
import { buildUpdateFields } from 'src/common/utils/sql-builder.util';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const { tenantId, name, email, phone, status } = createUserDto;
    const query = `
      INSERT INTO users (tenant_id, name, email, phone, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await this.databaseService.query(query, [
      tenantId,
      name,
      email,
      phone,
      status || 'active',
    ]);
    return result.rows[0];
  }

  async findAll() {
    const query = `SELECT * FROM users ORDER BY created_at DESC`;
    const result = await this.databaseService.query(query);
    return result.rows;
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
    const { fieldsString, values, nextIdx } = buildUpdateFields(updateUserDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id);
    const query = `UPDATE users SET ${fieldsString} WHERE id = $${nextIdx} RETURNING *`;
    const result = await this.databaseService.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async remove(id: number) {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await this.databaseService.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} removed successfully` };
  }
}
