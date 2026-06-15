import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    await this.db.query(
      'INSERT INTO inventory (tenant_id, warehouse_id, product_id, qty) VALUES ($1, $2, $3, $4)',
      [
        createInventoryDto.tenant_id,
        createInventoryDto.warehouse_id,
        createInventoryDto.product_id,
        createInventoryDto.qty,
      ],
    );
    return { message: 'Inventory record created successfully' };
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(this.db, 'inventory', query, [], {
      tenant_id,
      warehouse_id: query.warehouse_id,
      product_id: query.product_id,
    });
  }

  async findOne(id: number) {
    const result = await this.db.query(
      'SELECT * FROM inventory WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Inventory record with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    await this.db.query(
      'UPDATE inventory SET qty = COALESCE($1, qty) WHERE id = $2',
      [updateInventoryDto.qty, id],
    );
    return { message: 'Inventory updated successfully' };
  }

  async remove(id: number) {
    const result = await this.db.query(
      'DELETE FROM inventory WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Inventory record with ID ${id} not found`);
    }
    return { message: 'Inventory record deleted successfully' };
  }
}
