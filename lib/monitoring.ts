import * as Sentry from "@sentry/nextjs";
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("ComputeLearn");

export function captureAppError(error: unknown, extra?: Record<string, unknown>) {
  Sentry.captureException(normalizeError(error), { extra });
}

export async function runWithSpan<T>(
  name: string,
  work: () => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
          span.setAttribute(key, value);
        }
      }

      const result = await work();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(normalizeError(error));
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
