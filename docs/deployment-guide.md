# Deployment Guide

Operational instructions for deploying ComputeLearn to production.

## Prerequisites

- Node.js 20+ (runtime)
- PostgreSQL 15+ (database)
- A registered domain with DNS control
- TLS certificate (Let's Encrypt or your CA)
- Docker 24+ and Docker Compose v2 (for container deployment)

## Environment Variables

Copy `.env.production.template` and fill in required values:

```bash
cp .env.production.template .env.production
```

| Variable                            | Required | Description                                    |
| ----------------------------------- | -------- | ---------------------------------------------- |
| `NODE_ENV`                          | Yes      | Must be `production`                           |
| `DATABASE_URL`                      | Yes      | PostgreSQL connection string                   |
| `AUTH_SECRET`                       | Yes      | Random secret — generate with `npx auth secret`|
| `AUTH_GOOGLE_ID`                    | Yes      | Google OAuth client ID                         |
| `AUTH_GOOGLE_SECRET`                | Yes      | Google OAuth client secret                     |
| `NEXTAUTH_URL`                      | Yes      | Canonical URL (e.g. `https://app.example.com`) |
| `SENTRY_DSN`                        | No       | Sentry project DSN for error monitoring        |
| `SENTRY_ENVIRONMENT`               | No       | Defaults to `production`                       |
| `SENTRY_TRACES_SAMPLE_RATE`        | No       | Trace sampling rate (default: `0.1`)           |
| `OTEL_SERVICE_NAME`                | No       | OpenTelemetry service name                     |
| `PORT`                              | No       | Defaults to `3000`                             |

## Docker Deployment

### Build

```bash
docker build -t computelearn-platform .
```

### Run with Compose

For production, use the production override:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

This adds resource limits, restart policies, and proper health checks.

### Verify containers

```bash
docker compose ps
curl -f http://localhost:3000/api/health
```

## Vercel Deployment

1. Connect the repository in the Vercel dashboard.
2. Set all required environment variables in Project Settings → Environment Variables.
3. Build settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Deploy. Vercel handles TLS and CDN automatically.

## Database Migration

Run migrations against the production database before or during deployment:

```bash
npx prisma migrate deploy
```

This applies all pending migrations. Never use `prisma migrate dev` in production.

## CDN / Static Assets

Next.js serves static assets from `/_next/static/`. For Docker deployments:

- Place a CDN or reverse proxy (e.g. Cloudflare, Nginx) in front of the app.
- Set `Cache-Control: public, max-age=31536000, immutable` for `/_next/static/*` paths.
- The app container should not serve static assets directly at scale.

For Vercel deployments, static assets are automatically edge-cached.

## Health Check

The app exposes `GET /api/health` which returns:

```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "uptime": 12345.67,
    "version": "0.2.0"
  }
}
```

- Returns **200** when healthy.
- Returns **503** with `status: "unhealthy"` when the database is unreachable.

Use this endpoint for load balancer health checks and Docker `HEALTHCHECK`.

## Rollback Procedure

### Docker

```bash
# Tag the current release before deploying
docker tag computelearn-platform computelearn-platform:previous

# Deploy the new version
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# If the new version fails health checks, roll back
docker tag computelearn-platform:previous computelearn-platform:latest
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Vercel

Use the Vercel dashboard Deployments tab to instantly redeploy a previous successful deployment.

### Database rollback

If a migration must be reverted:

1. Identify the migration to revert in `prisma/migrations/`.
2. Write a reverse migration SQL and apply it manually.
3. Prisma does not support automatic rollback — plan migrations carefully.
