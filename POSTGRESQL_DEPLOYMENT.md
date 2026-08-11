# Add PostgreSQL in Coolify

This milestone adds KirpiNova's production database schema and connection layer. The schema stores encrypted account envelopes; it does not store readable workspace content.

## Create the database

1. Open the KirpiNova project in Coolify.
2. Add a PostgreSQL resource to the same production environment.
3. Generate a long, random database password in Coolify.
4. Keep PostgreSQL on Coolify's private network. Do not expose port 5432 publicly.
5. Add an off-server, S3-compatible backup destination.

## Configure the application

Add these application environment variables using the internal hostname shown by Coolify:

```text
DATABASE_URL=postgresql://USER:PASSWORD@INTERNAL_POSTGRES_HOST:5432/kirpinova
DATABASE_POOL_MAX=10
DATABASE_SSL=false
```

Do not paste the real connection string into `.env.example`, Git, screenshots, or support messages.

## Apply the schema

Open the application terminal in Coolify and run:

```text
npm run db:migrate
```

The migration runner uses a PostgreSQL advisory lock, records every applied file, and runs each new migration in a transaction.

## Verify readiness

Keep `/api/health` as the container liveness check. Once PostgreSQL is configured, use `/api/ready` as the deployment readiness check.

A successful readiness response includes:

```json
{"status":"ready","service":"kirpinova-web"}
```

If the database is unavailable or `DATABASE_URL` is missing, readiness returns HTTP 503. It does not expose credentials.

## Backup requirement

Enable automated PostgreSQL backups before creating real accounts. Keep backups outside the Contabo VPS and perform a documented restore test before private beta. A backup that has never been restored is not yet proven.
