# Multi-Tenant Warehouse Management System

A robust, multi-tenant warehouse management backend built with **NestJS**, **PostgreSQL**, and **Redis**. The entire application is fully dockerized for seamless development and production deployments.

## 🚀 Tech Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Database Migrations**: node-pg-migrate
- **Containerization**: Docker & Docker Compose
- **Database Management**: pgAdmin 4

---

## 🛠️ Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose installed on your machine.
- (Optional) [Node.js](https://nodejs.org/) v22+ if you wish to run the app locally without Docker.

---

## ⚙️ Getting Started (Docker)

The absolute easiest way to run the application is using Docker. This will spin up the API, the Postgres database, the Redis cache, and pgAdmin all at once.

1. **Configure Environment Variables**
   Ensure you have your `.env.prod` file set up in the root directory. 
   *(Note: The `DATABASE_URL` for the API should use `postgres:5432` to connect internally).*

2. **Build and Run the Containers**
   Open your terminal and run:
   ```bash
   docker compose up --build -d
   ```

3. **Automatic Migrations**
   You do **not** need to create tables manually! 
   When the API container starts, it will automatically run `npm run migrate:up` to create all the necessary tables (e.g., `tenants`, `users`) before starting the NestJS server.

4. **Access the Application**
   - **API Server**: `http://localhost:8000` (Mapped to container port 3000)
   - **Postgres Database**: `localhost:5433` (Mapped to container port 5432)
   - **Redis**: `localhost:6380` (Mapped to container port 6379)

---

## 🐘 Managing the Database (pgAdmin)

pgAdmin is included in the Docker setup so you can visually manage your database.

1. Go to **`http://localhost:5050`** in your browser.
2. Log in with the default credentials:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`
3. Click **Add New Server** and enter the following in the Connection tab:
   - **Host name/address**: `postgres` *(Do not use localhost)*
   - **Port**: `5432`
   - **Maintenance database**: `multi-tenant-warehouse`
   - **Username**: `moeen` *(or your POSTGRES_USER)*
   - **Password**: `hasan23398` *(or your POSTGRES_PASSWORD)*

---

## 📜 Available Scripts

If you are developing locally without Docker, you can use these npm scripts:

- `npm run build` - Compiles the TypeScript code into the `/dist` folder.
- `npm run start:dev` - Starts the NestJS development server with hot-reloading.
- `npm run migrate:create <name>` - Creates a new empty migration file.
- `npm run migrate:up` - Applies all pending database migrations.
- `npm run migrate:down` - Rolls back the last database migration.

---

## 💡 Notes on Docker Port Mapping

To prevent conflicts with any databases you might already have running on your computer, the Docker Compose file uses strict `HOST:CONTAINER` port mappings:
- Postgres is exposed on your computer at `5433`, but runs internally on `5432`.
- Redis is exposed on your computer at `6380`, but runs internally on `6379`.
- The API is exposed on your computer at `8000`, but runs internally on `3000`.

When writing code inside the API, always connect to the **internal** ports (`postgres:5432` and `redis:6379`).
