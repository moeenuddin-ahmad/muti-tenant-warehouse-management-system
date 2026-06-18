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
            role VARCHAR(20) NOT NULL DEFAULT 'staff' REFERENCES roles(title),
            refresh_token VARCHAR(255),
            created_at DATE DEFAULT CURRENT_DATE,
            CONSTRAINT admin_cannot_be_deactivated CHECK (NOT (role = 'admin' AND status = 'inactive'))
        )
    `);

  pgm.sql(`
        CREATE OR REPLACE FUNCTION maintain_tenant_admin()
        RETURNS TRIGGER AS $$
        BEGIN
            -- INSERT: Force first user to be admin
            IF (TG_OP = 'INSERT') THEN
                IF NOT EXISTS (SELECT 1 FROM users WHERE tenant_id = NEW.tenant_id) THEN
                    NEW.role := 'admin';
                END IF;
                RETURN NEW;
            END IF;

            -- UPDATE: Prevent demoting the last admin
            IF (TG_OP = 'UPDATE') THEN
                IF (OLD.role = 'admin' AND NEW.role != 'admin') THEN
                    IF (SELECT COUNT(*) FROM users WHERE tenant_id = OLD.tenant_id AND role = 'admin') <= 1 THEN
                        RAISE EXCEPTION 'Cannot demote the last administrator of this tenant';
                    END IF;
                END IF;
                RETURN NEW;
            END IF;

            -- DELETE: Prevent deleting the last admin
            IF (TG_OP = 'DELETE') THEN
                IF (OLD.role = 'admin') THEN
                    IF (SELECT COUNT(*) FROM users WHERE tenant_id = OLD.tenant_id AND role = 'admin') <= 1 THEN
                        RAISE EXCEPTION 'Cannot delete the last administrator of this tenant';
                    END IF;
                END IF;
                RETURN OLD;
            END IF;

            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_maintain_tenant_admin
        BEFORE INSERT OR UPDATE OR DELETE ON users
        FOR EACH ROW
        EXECUTE FUNCTION maintain_tenant_admin();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
        DROP TRIGGER IF EXISTS trigger_maintain_tenant_admin ON users;
        DROP FUNCTION IF EXISTS maintain_tenant_admin;
        DROP TABLE IF EXISTS users;
        DROP TYPE IF EXISTS user_status;
    `);
};
