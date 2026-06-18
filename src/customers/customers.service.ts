import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';
import { buildUpdateFields } from '../common/utils/sql-builder.util';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async create(tenant_id: number, createCustomerDto: CreateCustomerDto) {
    await this.db.query(
      'INSERT INTO customers (tenant_id, name, phone) VALUES ($1, $2, $3)',
      [tenant_id, createCustomerDto.name, createCustomerDto.phone],
    );
    return { message: 'Customer created successfully' };
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(this.db, 'customers', query, ['name'], {
      tenant_id,
    });
  }

  async findOne(tenant_id: number, id: number) {
    const result = await this.db.query(
      'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(
    tenant_id: number,
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    const { fieldsString, values, nextIdx } =
      buildUpdateFields(updateCustomerDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE customers SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return { message: 'Customer updated successfully' };
  }

  async remove(tenant_id: number, id: number) {
    const result = await this.db.query(
      'DELETE FROM customers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return { message: 'Customer deleted successfully' };
  }
}
