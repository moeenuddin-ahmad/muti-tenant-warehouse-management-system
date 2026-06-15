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
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            sku VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at DATE DEFAULT CURRENT_DATE,
            UNIQUE(tenant_id, sku)
        )
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS products`);
};
