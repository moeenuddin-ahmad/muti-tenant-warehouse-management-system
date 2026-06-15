import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import { DatabaseService } from 'src/database/database.service';
import { buildUpdateFields } from 'src/common/utils/sql-builder.util';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class TenantsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createTenantDto: CreateTenantDto) {
    const { name, email, phone, status } = createTenantDto;
    const query = `
    INSERT INTO tenants (name, email, phone, status)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `;
    const result = await this.databaseService.query(query, [
      name,
      email,
      phone,
      status || 'default',
    ]);
    return result.rows[0];
  }

  async findAll(query: any) {
    return paginate(this.databaseService, 'tenants', query, [
      'name',
      'email',
      'phone',
    ]);
  }

  async findOne(id: number) {
    const query = `SELECT id, name, email, phone, status, created_at FROM tenants WHERE id = $1`;
    const result = await this.databaseService.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateTenantDto: UpdateTenantDto) {
    const { fieldsString, values, nextIdx } =
      buildUpdateFields(updateTenantDto);

    if (values.length === 0)
      throw new BadRequestException('No fields to update');

    values.push(id);
    const query = `UPDATE tenants SET ${fieldsString} WHERE id = $${nextIdx} RETURNING id`;
    const result = await this.databaseService.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return { message: `Tenant with ID ${id} updated successfully` };
  }

  async remove(id: number) {
    const query = `DELETE FROM tenants WHERE id = $1 RETURNING id`;
    const result = await this.databaseService.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return { message: `Tenant with ID ${id} removed successfully` };
  }
}
