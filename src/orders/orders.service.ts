import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';
import { buildUpdateFields } from '../common/utils/sql-builder.util';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly customersService: CustomersService,
  ) {}

  async create(tenant_id: number, createOrderDto: CreateOrderDto) {
    const { customer_id, status, items } = createOrderDto;

    // Validate customer belongs to this tenant
    await this.customersService.checkExists(tenant_id, customer_id);

    // Ensure no pending order already exists for this customer in this tenant
    const existingPending = await this.db.query(
      `SELECT id FROM orders WHERE tenant_id = $1 AND customer_id = $2 AND status = 'pending'`,
      [tenant_id, customer_id],
    );
    if (existingPending.rows.length > 0) {
      throw new ConflictException(
        'A pending order already exists for this customer. Complete or cancel it before creating a new one.',
      );
    }

    // Start Transaction
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert Order
      const orderResult = await client.query(
        'INSERT INTO orders (tenant_id, customer_id, status) VALUES ($1, $2, $3) RETURNING id',
        [tenant_id, customer_id, status || 'pending'],
      );
      const orderId = orderResult.rows[0].id;

      // 2. Insert Order Items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, item.total_price],
        );
      }

      await client.query('COMMIT');
      return { message: 'Order created successfully', orderId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InternalServerErrorException(
        'Failed to create order: ' + error.message,
      );
    } finally {
      client.release();
    }
  }

  async findAll(tenant_id: number, query: any) {
    return await paginate(this.db, 'orders', query, ['status'], {
      tenant_id,
    });
  }

  async findOne(tenant_id: number, id: number) {
    const orderResult = await this.db.query(
      'SELECT o.*, c.name as customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = $1 AND o.tenant_id = $2',
      [id, tenant_id],
    );

    if (orderResult.rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const itemsResult = await this.db.query(
      'SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',
      [id],
    );

    return {
      ...orderResult.rows[0],
      items: itemsResult.rows,
    };
  }

  async update(tenant_id: number, id: number, updateOrderDto: UpdateOrderDto) {
    const { fieldsString, values, nextIdx } = buildUpdateFields(updateOrderDto);

    if (values.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    values.push(id, tenant_id);
    const query = `UPDATE orders SET ${fieldsString} WHERE id = $${nextIdx} AND tenant_id = $${nextIdx + 1} RETURNING id`;
    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return { message: 'Order updated successfully' };
  }

  async updateStatus(tenant_id: number, id: number, dto: UpdateOrderStatusDto) {
    const result = await this.db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING id',
      [dto.status, id, tenant_id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return { message: `Order status updated to '${dto.status}'` };
  }

  async remove(tenant_id: number, id: number) {
    const result = await this.db.query(
      'DELETE FROM orders WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenant_id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { message: 'Order deleted successfully' };
  }
}
