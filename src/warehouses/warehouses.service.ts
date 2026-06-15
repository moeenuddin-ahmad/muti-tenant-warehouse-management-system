import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouses.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class WarehousesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    await this.db.query(
      'INSERT INTO warehouses (tenant_id, name, address, status) VALUES ($1, $2, $3, $4)',
      [
        createWarehouseDto.tenant_id,
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

  async findOne(id: number) {
    const result = await this.db.query(
      'SELECT * FROM warehouses WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    await this.db.query(
      'UPDATE warehouses SET name = COALESCE($1, name), address = COALESCE($2, address), status = COALESCE($3, status) WHERE id = $4',
      [
        updateWarehouseDto.name,
        updateWarehouseDto.address,
        updateWarehouseDto.status,
        id,
      ],
    );
    return { message: 'Warehouse updated successfully' };
  }

  async remove(id: number) {
    const result = await this.db.query(
      'DELETE FROM warehouses WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return { message: 'Warehouse deleted successfully' };
  }
}
