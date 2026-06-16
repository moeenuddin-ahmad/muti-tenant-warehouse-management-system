import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    await this.db.query(
      'INSERT INTO customers (tenant_id, name, phone) VALUES ($1, $2, $3)',
      [
        createCustomerDto.tenant_id,
        createCustomerDto.name,
        createCustomerDto.phone,
      ],
    );
    return { message: 'Customer created successfully' };
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(this.db, 'customers', query, ['name'], {
      tenant_id,
    });
  }

  async findOne(id: number) {
    const result = await this.db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const { name, phone } = updateCustomerDto;
    const result = await this.db.query(
      'UPDATE customers SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id',
      [name, phone, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return { message: 'Customer updated successfully' };
  }

  async remove(id: number) {
    const result = await this.db.query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return { message: 'Customer deleted successfully' };
  }
}
