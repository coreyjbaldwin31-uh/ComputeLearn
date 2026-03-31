import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    enabled: true,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: readSampleRate("SENTRY_TRACES_SAMPLE_RATE", 0.1),
    debug: readBoolean("SENTRY_DEBUG"),
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
