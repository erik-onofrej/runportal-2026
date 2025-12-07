# Docker Compose Template System

This directory contains a reusable template system for generating `docker-compose.yaml` files with environment-specific configurations.

## Files

- **docker-compose.template.yaml** - Template file with environment variable placeholders
- **generate-docker-compose.js** - Script to generate docker-compose.yaml from template
- **.env.example** - Example environment variables (copy to .env and customize)
- **docker-compose.yaml** - Generated file (not committed to git)
- **.env** - Your local environment variables (not committed to git)

## Quick Start

### 1. Create your environment file

```bash
cd database_prisma
cp .env.example .env
```

### 2. Customize your .env file

Edit `.env` and change the values to match your project:

```bash
# Project Configuration
PROJECT_NAME=myproject          # Change to your project name
POSTGRES_VERSION=17
POSTGRES_PORT=5439             # Change to avoid port conflicts
POSTGRES_USER=myuser           # Change to secure username
POSTGRES_PASSWORD=mypassword   # Change to secure password
POSTGRES_DB=mydb               # Change to your database name
PGADMIN_PORT=8889              # Change to avoid port conflicts
PGADMIN_EMAIL=admin@example.com  # Change to your email
PGADMIN_PASSWORD=adminpass     # Change to secure password
```

### 3. Generate docker-compose.yaml

```bash
node generate-docker-compose.js
```

Or from project root:

```bash
node database_prisma/generate-docker-compose.js
```

### 4. Start your services

```bash
docker-compose up -d
```

## Reusing in Other Projects

To use this template system in a new project:

1. **Copy these files** to your new project's database directory:
   - `docker-compose.template.yaml`
   - `generate-docker-compose.js`
   - `.env.example`

2. **Create .env** from the example:
   ```bash
   cp .env.example .env
   ```

3. **Customize .env** with your project-specific values

4. **Generate docker-compose.yaml**:
   ```bash
   node generate-docker-compose.js
   ```

5. **Add to .gitignore**:
   ```gitignore
   # Exclude generated files and secrets
   database_prisma/.env
   database_prisma/docker-compose.yaml

   # Keep template files
   !database_prisma/.env.example
   !database_prisma/docker-compose.template.yaml
   !database_prisma/generate-docker-compose.js
   !database_prisma/README.md
   ```

## Environment Variables

All available environment variables and their purposes:

| Variable | Description | Example |
|----------|-------------|---------|
| `PROJECT_NAME` | Unique identifier for your project | `behportal` |
| `POSTGRES_VERSION` | PostgreSQL Docker image version | `17` |
| `POSTGRES_PORT` | Host port for PostgreSQL | `5439` |
| `POSTGRES_USER` | PostgreSQL username | `test` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `test` |
| `POSTGRES_DB` | Default database name | `behportal` |
| `PGADMIN_PORT` | Host port for pgAdmin | `8889` |
| `PGADMIN_EMAIL` | pgAdmin login email | `test@example.com` |
| `PGADMIN_PASSWORD` | pgAdmin login password | `test` |

## Accessing Services

After starting with `docker-compose up -d`:

- **PostgreSQL**: `localhost:${POSTGRES_PORT}`
  - Username: `${POSTGRES_USER}`
  - Password: `${POSTGRES_PASSWORD}`
  - Database: `${POSTGRES_DB}`

- **pgAdmin**: `http://localhost:${PGADMIN_PORT}`
  - Email: `${PGADMIN_EMAIL}`
  - Password: `${PGADMIN_PASSWORD}`

## Docker Compose Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (deletes all data!)
docker-compose down -v

# Restart services
docker-compose restart
```

## Troubleshooting

### Port already in use

If you get port conflict errors, change `POSTGRES_PORT` or `PGADMIN_PORT` in your `.env` file to unused ports, then regenerate:

```bash
node generate-docker-compose.js
docker-compose down
docker-compose up -d
```

### Missing environment variables

If you see errors about missing variables, ensure your `.env` file contains all variables from `.env.example`:

```bash
diff .env.example .env
```

### Regenerating configuration

Any time you update `.env`, regenerate the docker-compose.yaml:

```bash
node generate-docker-compose.js
docker-compose up -d
```
