import { formatEnumForSql } from '../src/common/utils/sql-builder.util';
import { UserStatus } from '../src/users/enums/users.enums';

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
  pgm.sql(`
    CREATE TYPE user_status AS ENUM (${formatEnumForSql(UserStatus)})
    `);

  pgm.sql(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(11) UNIQUE NOT NULL CHECK (LENGTH(phone) = 11),
            status user_status NOT NULL DEFAULT 'active',
            role VARCHAR(20) NOT NULL REFERENCES roles(title) ON DELETE CASCADE,
            refresh_token VARCHAR(255),
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
};
