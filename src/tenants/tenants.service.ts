import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TenantsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createTenantDto: CreateTenantDto) {
    const { name, email, phone, status } = createTenantDto;
    const query = `
    INSERT INTO tenants (name, email, phone, status)
    VALUES('${name}', '${email}', '${phone}', '${status ? status : 'default'}')
    RETURNING *;
    `;
    const result = await this.databaseService.query(query);
    return result.rows[0];
  }

  async findAll() {
    const query = `SELECT * FROM tenants`;
    const result = await this.databaseService.query(query);
    return result.rows;
  }

  async findOne(id: number) {
    const query = `SELECT * FROM tenants WHERE id = ${id}`;
    const result = await this.databaseService.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return result.rows;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto) {
    const { name, email, phone, status } = updateTenantDto;
    let updates: string[] = [];

    if (name) updates.push(`name = '${name}'`);
    if (email) updates.push(`email = '${email}'`);
    if (phone) updates.push(`phone = '${phone}'`);
    if (status) updates.push(`status = '${status}'`);

    const query = `UPDATE tenants SET ${updates.join(', ')} WHERE id = ${id} RETURNING *`;
    const result = await this.databaseService.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async remove(id: number) {
    const query = `DELETE FROM tenants WHERE id = ${id} RETURNING *`;
    const result = await this.databaseService.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return `This action removes a #${id} tenant`;
  }
}
