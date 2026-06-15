import { WarehouseStatus } from '../src/warehouses/enums/warehouses.enums.ts';
import { formatEnumForSql } from '../src/common/utils/sql-builder.util.ts';

export const up = (pgm) => {
  pgm.sql(`
        CREATE TYPE warehouse_status AS ENUM (${formatEnumForSql(WarehouseStatus)});
    `);

  pgm.sql(`
        CREATE TABLE IF NOT EXISTS warehouses (
            id SERIAL PRIMARY KEY,
            tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            address TEXT NOT NULL,
            status warehouse_status NOT NULL DEFAULT 'active',
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
  pgm.sql(`DROP TABLE IF EXISTS warehouses`);
  pgm.sql(`DROP TYPE IF EXISTS warehouse_status`);
};
