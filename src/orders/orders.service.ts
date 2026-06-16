import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';
import { DatabaseService } from '../database/database.service';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tenant_id, customer_id, status, items } = createOrderDto;

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

  async findOne(id: number) {
    const orderResult = await this.db.query(
      'SELECT o.*, c.name as customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = $1',
      [id],
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

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const { status } = updateOrderDto;
    const result = await this.db.query(
      'UPDATE orders SET status = COALESCE($1, status) WHERE id = $2 RETURNING id',
      [status, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return { message: 'Order updated successfully' };
  }

  async remove(id: number) {
    const result = await this.db.query(
      'DELETE FROM orders WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { message: 'Order deleted successfully' };
  }
}
