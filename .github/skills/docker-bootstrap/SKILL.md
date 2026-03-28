---
name: "docker-bootstrap"
description: "Establish or repair Docker-based local reproducibility. Use when: the repo needs a Dockerfile, Compose setup, env templates, local service orchestration, or better startup consistency. Keywords: docker, compose, container, devcontainer, environment, local development, Dockerfile, services, ports, volumes, healthcheck."
---

# Docker Bootstrap

Create or repair Docker-based local development infrastructure so every contributor gets a consistent, reproducible environment.

## When to Use

- Project has no Dockerfile and needs one
- Existing Docker setup is broken, stale, or incomplete
- Adding a database, cache, or worker service to the local stack
- `.env` or environment variable handling is inconsistent
- README Docker instructions are missing or wrong
- Onboarding a new contributor who needs "clone and run" to work

## Required Context

1. **Read `PRD.md`** if it exists — understand the product and any infrastructure requirements.
2. **Read `README.md`** if it exists — understand current setup instructions and identify Docker gaps.
3. **Read `package.json`** (or equivalent manifest) — identify build, start, and dev commands.
4. **Read existing Docker files** — `Dockerfile`, `docker-compose.yml`, `compose.yaml`, `.dockerignore`.
5. **Read `.env.example`** or `.env.template`** if they exist — understand current env var expectations.
6. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Assess Docker Fit

Determine whether Docker is appropriate:

| Signal | Docker Likely Helpful |
|--------|----------------------|
| Multi-service app (app + db + cache) | Yes |
| Complex environment setup | Yes |
| Team with varied local environments | Yes |
| Single static site, no services | Maybe — keeps builds consistent |
| Tiny script or CLI tool | Probably not |

If Docker is not appropriate, document why and stop. Do not add Docker for its own sake.

### Step 2 — Detect Current Stack

Identify what the container needs to support:

| Component | Detection |
|-----------|----------|
| **Runtime** | `package.json` engines, `.nvmrc`, `.python-version`, `go.mod` |
| **Framework** | `next.config.*`, `vite.config.*`, `django`, `flask`, `express` |
| **Database** | `prisma/`, `migrations/`, `knex`, `sequelize`, connection strings |
| **Cache** | Redis references, `ioredis`, `redis` in dependencies |
| **Queue/Worker** | Bull, Celery, Sidekiq, or background job references |
| **Build output** | `.next/`, `dist/`, `build/`, `out/` |
| **Port** | `PORT` env var, `next.config.*`, `server.ts` listen call |

Record each detected component. Do not guess services that have no evidence.

### Step 3 — Create or Update Dockerfile

Follow these principles:

- **Use multi-stage builds** when the final image should not contain dev dependencies or build tools.
- **Pin the base image** to a specific major.minor version (e.g., `node:22-alpine`, not `node:latest`).
- **Match the runtime version** to what `package.json` engines, `.nvmrc`, or CI specifies.
- **Copy lockfile first** for layer caching (`COPY package-lock.json ./` before `COPY . .`).
- **Set a non-root user** for the runtime stage.
- **Expose the correct port** matching the app's configuration.
- **Use HEALTHCHECK** when the app has a health endpoint.

Minimal template for a Node.js app:

```dockerfile
FROM node:<version>-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

Adapt to the actual stack. Do not use this template blindly.

### Step 4 — Create or Update Compose File

Use `docker-compose.yml` (or `compose.yaml` if the project already uses that name).

Principles:

- **Name services clearly** — `app`, `db`, `cache`, `worker`, not `service1`
- **Use `depends_on` with `condition: service_healthy`** when services need startup ordering
- **Map ports explicitly** — `"3000:3000"`, not just `"3000"`
- **Use named volumes** for persistent data (databases)
- **Use bind mounts** for source code in development (hot reload)
- **Set environment variables** via `env_file` pointing to `.env`
- **Add healthchecks** for every service that supports them

Minimal template:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  db-data:
```

Only include services the project actually uses. Remove the db service if there is no database.

### Step 5 — Create or Update .dockerignore

Exclude files that should not enter the build context:

```
node_modules
.next
dist
build
.env
.env.local
.git
*.md
```

Adapt to the actual project structure.

### Step 6 — Create or Update .env.example

List every environment variable the app and services need:

```
# App
NODE_ENV=development
PORT=3000

# Database (if applicable)
DB_HOST=db
DB_PORT=5432
DB_USER=computelearn
DB_PASSWORD=localdev
DB_NAME=computelearn
```

Rules:
- Use safe, obvious placeholder values for local development
- Never put real secrets in `.env.example`
- Add a comment for each variable or group explaining its purpose
- Ensure every variable referenced in `docker-compose.yml` appears here

### Step 7 — Wire Hot Reload (Development)

For local development, ensure the container supports live code changes:

- Bind-mount the source directory
- Exclude `node_modules` from the bind mount (use anonymous volume)
- Use the framework's dev server command instead of production start
- Verify file watching works (some frameworks need `WATCHPACK_POLLING=true` on Windows)

### Step 8 — Update README.md

Add or update a Docker section with exact commands:

```markdown
## Docker

### First-time setup
cp .env.example .env
docker compose build

### Start
docker compose up

### Stop
docker compose down

### Rebuild after dependency changes
docker compose build --no-cache
docker compose up

### View logs
docker compose logs -f app

### Run tests in container
docker compose exec app npm test
```

Keep commands copy-pasteable. Remove any stale Docker instructions.

### Step 9 — Optional: devcontainer

If the repo would benefit from VS Code Dev Containers:

- Create `.devcontainer/devcontainer.json`
- Reference the Compose file or Dockerfile
- Install relevant VS Code extensions automatically
- Set default terminal and formatter

Only add if the team uses VS Code and the project has enough complexity to justify it.

## Validation

After creating or updating Docker assets:

1. **`docker compose build`** — image builds without errors
2. **`docker compose up -d`** — all services start
3. **`docker compose ps`** — all services show healthy or running
4. **`curl http://localhost:<port>`** (or equivalent) — app responds
5. **`docker compose down`** — clean shutdown, no orphans
6. **`docker compose up`** again — starts cleanly from stopped state

Record each result.

## Output Format

```
## Container Validation

### Assets Created or Updated
- [file — what was done]

### Service Inventory
| Service | Image | Port | Healthcheck | Status |
|---------|-------|------|-------------|--------|
| app | local build | 3000 | ... | healthy/running |
| db | postgres:16 | 5432 | pg_isready | healthy |

### Validation Results
| Check | Command | Result |
|-------|---------|--------|
| Build | `docker compose build` | pass/fail |
| Start | `docker compose up -d` | pass/fail |
| Health | `docker compose ps` | pass/fail |
| Response | `curl localhost:3000` | pass/fail |
| Shutdown | `docker compose down` | pass/fail |
| Restart | `docker compose up -d` | pass/fail |

### README Updated
- [what was added or changed]

### Remaining Gaps
- [anything that still needs attention]
```

## Rules

- Do not hardcode secrets. Use `.env` files and environment variable references.
- Do not add unnecessary services. Only include what the project actually uses.
- Do not overengineer production parity. The goal is local reproducibility, not a production deployment.
- Do not leave Docker instructions undocumented. Every Docker command must appear in README.md.
- Do not use `latest` tags. Pin base images to specific versions.
- End with a section titled **"Container Validation"** showing build, start, health, and response results.
