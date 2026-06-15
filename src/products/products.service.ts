import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  async create(createProductDto: CreateProductDto) {
    await this.db.query(
      'INSERT INTO products (tenant_id, sku, name, description) VALUES ($1, $2, $3, $4)',
      [
        createProductDto.tenant_id,
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
      {
        tenant_id,
      },
    );
  }

  async findOne(id: number) {
    const result = await this.db.query('SELECT * FROM products WHERE id = $1', [
      id,
    ]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.db.query(
      'UPDATE products SET sku = COALESCE($1, sku), name = COALESCE($2, name), description = COALESCE($3, description) WHERE id = $4',
      [
        updateProductDto.sku,
        updateProductDto.name,
        updateProductDto.description,
        id,
      ],
    );
    return { message: 'Product updated successfully' };
  }

  async remove(id: number) {
    const result = await this.db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product deleted successfully' };
  }
}
