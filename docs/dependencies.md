# Dependency Decisions

## Package Manager

npm. Lockfile is `package-lock.json` (lockfileVersion 3). No other package managers are in use.

## Runtime

Node 20 is the target runtime. Pinned in:

- `package.json` `engines.node` — `>=20`
- `.nvmrc` — `20`
- `Dockerfile` — `node:20-alpine`
- `.github/workflows/ci.yml` — `node-version: 20`

## Newman (devDependency)

`newman@6` is used only as a CLI tool for API smoke tests (`npm run api:test`). It is never imported in source code and never ships to production.

Newman's transitive dependency tree contains 15 known vulnerabilities (6 moderate, 8 high, 1 critical) in packages like `handlebars`, `node-forge`, `lodash`, `flatted`, `underscore`, `jose`, and `qs`. All of these are deep transitive dependencies of `postman-runtime`.

These cannot be fixed without downgrading to `newman@2`, which is a breaking change. The risk is accepted because:

1. Newman runs only in development/CI as a CLI subprocess
2. None of these packages are used in application code
3. None ship in the production Docker image
4. The vulnerable code paths (template injection, crypto forgery) are not reachable through newman's CLI usage

If Postman releases `newman@7` with an updated runtime, upgrade then.

## PostCSS

`postcss.config.mjs` exists with an empty `plugins` object. Next.js provides default PostCSS handling. The file is kept to prevent Next.js from searching parent directories for config.

## Observability (production dependencies)

Three packages support optional monitoring:

| Package | Version | Purpose |
| ------- | ------- | ------- |
| `@sentry/nextjs` | ^10.46.0 | Error capture, request error reporting, router transition hooks |
| `@opentelemetry/api` | ^1.9.1 | Span creation and trace context in `lib/monitoring.ts` |
| `@vercel/otel` | ^2.1.1 | OpenTelemetry registration in `instrumentation.ts` |

All three are DSN-gated — when `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are empty, Sentry stays disabled and the overhead is negligible. OpenTelemetry registers but produces no exports without a configured collector.

These packages are imported by:

- `instrumentation.ts` — server-side OTel + Sentry init
- `instrumentation-client.ts` — client-side Sentry router hooks
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — SDK init per runtime
- `lib/monitoring.ts` — `captureAppError()` and `runWithSpan()` helpers
- `components/error-boundary.tsx` — React error boundary capture
- `app/error.tsx` — App Router error boundary capture

## Formatter

No formatter (Prettier, Biome, etc.) is installed. The project relies on ESLint for code quality. If a formatter is added later, add a `format` script to `package.json`.
