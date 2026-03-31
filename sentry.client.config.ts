import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    enabled: true,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: readSampleRate("NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE", 0),
    debug: readBoolean("NEXT_PUBLIC_SENTRY_DEBUG"),
    sendDefaultPii: false,
  });
}

function readSampleRate(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function readBoolean(name: string) {
  const value = process.env[name]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}
