import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';
import { buildUpdateFields } from '../common/utils/sql-builder.util';
import { ProductsService } from '../products/products.service';
import { WarehousesService } from '../warehouses/warehouses.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly productsService: ProductsService,
    private readonly warehousesService: WarehousesService,
  ) {}

  async create(tenant_id: number, createInventoryDto: CreateInventoryDto) {
    // Validate that warehouse and product exist for this tenant
    await Promise.all([
      this.warehousesService.checkExists(
        tenant_id,
        createInventoryDto.warehouse_id,
      ),
      this.productsService.checkExists(
        tenant_id,
        createInventoryDto.product_id,
      ),
    ]);

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
    const { fieldsString, values, nextIdx } =
      buildUpdateFields(updateInventoryDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE inventory SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.db.query(query, values);

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
