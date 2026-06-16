import { formatEnumForSql } from '../src/common/utils/sql-builder.util';
import { OrderStatus } from '../src/orders/enums/orders.enums';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(
    `CREATE TYPE order_status AS ENUM (${formatEnumForSql(OrderStatus)})`,
  );

  pgm.sql(`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            status order_status NOT NULL DEFAULT 'pending',
            created_at DATE DEFAULT CURRENT_DATE
        )
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS orders`);
  pgm.sql(`DROP TYPE IF EXISTS order_status`);
};
