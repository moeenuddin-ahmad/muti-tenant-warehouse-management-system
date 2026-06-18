import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async create(tenant_id: number, createInventoryDto: CreateInventoryDto) {
    await this.db.query(
      'INSERT INTO inventory (tenant_id, warehouse_id, product_id, qty) VALUES ($1, $2, $3, $4)',
      [
        tenant_id,
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

  async findOne(tenant_id: number, id: number) {
    const result = await this.db.query(
      'SELECT * FROM inventory WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Inventory record not found`);
    }
    return result.rows[0];
  }

  async update(
    tenant_id: number,
    id: number,
    updateInventoryDto: UpdateInventoryDto,
  ) {
    const result = await this.db.query(
      'UPDATE inventory SET qty = COALESCE($1, qty) WHERE id = $2 AND tenant_id = $3 RETURNING id',
      [updateInventoryDto.qty, id, tenant_id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Inventory record not found`);
    }

    return { message: 'Inventory updated successfully' };
  }

  async remove(tenant_id: number, id: number) {
    const result = await this.db.query(
      'DELETE FROM inventory WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Inventory record not found`);
    }
    return { message: 'Inventory record deleted successfully' };
  }
}
