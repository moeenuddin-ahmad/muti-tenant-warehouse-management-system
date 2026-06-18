import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouses.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';
import { buildUpdateFields } from '../common/utils/sql-builder.util';

@Injectable()
export class WarehousesService {
  constructor(private readonly db: DatabaseService) {}

  async checkExists(tenant_id: number, id: number): Promise<void> {
    const result = await this.db.query(
      'SELECT id FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
  }

  async create(tenant_id: number, createWarehouseDto: CreateWarehouseDto) {
    await this.db.query(
      'INSERT INTO warehouses (tenant_id, name, address, status) VALUES ($1, $2, $3, $4)',
      [
        tenant_id,
        createWarehouseDto.name,
        createWarehouseDto.address,
        createWarehouseDto.status || 'active',
      ],
    );
    return { message: 'Warehouse created successfully' };
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(this.db, 'warehouses', query, ['name', 'address'], {
      tenant_id,
    });
  }

  async findOne(tenant_id: number, id: number) {
    const result = await this.db.query(
      'SELECT * FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(
    tenant_id: number,
    id: number,
    updateWarehouseDto: UpdateWarehouseDto,
  ) {
    const { fieldsString, values, nextIdx } =
      buildUpdateFields(updateWarehouseDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE warehouses SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return { message: 'Warehouse updated successfully' };
  }

  async remove(tenant_id: number, id: number) {
    const result = await this.db.query(
      'DELETE FROM warehouses WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return { message: 'Warehouse deleted successfully' };
  }
}
