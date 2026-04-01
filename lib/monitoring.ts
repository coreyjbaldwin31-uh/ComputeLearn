import * as Sentry from "@sentry/nextjs";

export function captureAppError(error: unknown, extra?: Record<string, unknown>) {
  Sentry.captureException(normalizeError(error), { extra });
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error === null || error === undefined) return new Error("Unknown error");
  if (typeof error === "string") return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}
