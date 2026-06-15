/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
import { UserStatus } from '../src/users/enums/users.enums.ts';
import { formatEnumForSql } from '../src/common/utils/sql-builder.util.ts';

export const up = (pgm) => {
  // Use our reusable utility to format the enum for SQL
  pgm.sql(`
      CREATE TYPE user_status AS ENUM (${formatEnumForSql(UserStatus)})
    `);

  // 2. Create the table using the new ENUM type
  pgm.sql(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(11) UNIQUE NOT NULL CHECK (LENGTH(phone) = 11),
            status user_status NOT NULL DEFAULT 'active',
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
  pgm.sql(`DROP TABLE IF EXISTS users`);
  pgm.sql(`DROP TYPE IF EXISTS user_status`);
};
