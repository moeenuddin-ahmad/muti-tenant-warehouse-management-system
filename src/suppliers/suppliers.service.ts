import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/suppliers.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class SuppliersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    await this.db.query(
      'INSERT INTO suppliers (tenant_id, name, phone, address) VALUES ($1, $2, $3, $4)',
      [
        createSupplierDto.tenant_id,
        createSupplierDto.name,
        createSupplierDto.phone,
        createSupplierDto.address,
      ],
    );
    return { message: 'Supplier created successfully' };
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(this.db, 'suppliers', query, ['name'], {
      tenant_id,
    });
  }

  async findOne(id: number) {
    const result = await this.db.query(
      'SELECT * FROM suppliers WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const { name, phone, address } = updateSupplierDto;
    const result = await this.db.query(
      'UPDATE suppliers SET name = COALESCE($1, name), phone = COALESCE($2, phone), address = COALESCE($3, address) WHERE id = $4 RETURNING id',
      [name, phone, address, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return { message: 'Supplier updated successfully' };
  }

  async remove(id: number) {
    const result = await this.db.query(
      'DELETE FROM suppliers WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return { message: 'Supplier deleted successfully' };
  }
}
