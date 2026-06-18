import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';
import { buildUpdateFields } from '../common/utils/sql-builder.util';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  async checkExists(tenant_id: number, id: number): Promise<void> {
    const result = await this.db.query(
      'SELECT id FROM products WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async create(tenant_id: number, createProductDto: CreateProductDto) {
    await this.db.query(
      'INSERT INTO products (tenant_id, sku, name, description) VALUES ($1, $2, $3, $4)',
      [
        tenant_id,
        createProductDto.sku,
        createProductDto.name,
        createProductDto.description,
      ],
    );
    return { message: 'Product created successfully' };
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(
      this.db,
      'products',
      query,
      ['sku', 'name', 'description'],
      { tenant_id },
    );
  }

  async findOne(tenant_id: number, id: number) {
    const result = await this.db.query(
      'SELECT * FROM products WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(
    tenant_id: number,
    id: number,
    updateProductDto: UpdateProductDto,
  ) {
    const { fieldsString, values, nextIdx } =
      buildUpdateFields(updateProductDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE products SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product updated successfully' };
  }

  async remove(tenant_id: number, id: number) {
    const result = await this.db.query(
      'DELETE FROM products WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product deleted successfully' };
  }
}
