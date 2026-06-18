import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/suppliers.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';
import { buildUpdateFields } from '../common/utils/sql-builder.util';

@Injectable()
export class SuppliersService {
  constructor(private readonly db: DatabaseService) {}

  async create(tenant_id: number, createSupplierDto: CreateSupplierDto) {
    await this.db.query(
      'INSERT INTO suppliers (tenant_id, name, phone, address) VALUES ($1, $2, $3, $4)',
      [
        tenant_id,
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

  async findOne(tenant_id: number, id: number) {
    const result = await this.db.query(
      'SELECT * FROM suppliers WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(
    tenant_id: number,
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    const { fieldsString, values, nextIdx } =
      buildUpdateFields(updateSupplierDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE suppliers SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return { message: 'Supplier updated successfully' };
  }

  async remove(tenant_id: number, id: number) {
    const result = await this.db.query(
      'DELETE FROM suppliers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return { message: 'Supplier deleted successfully' };
  }
}
