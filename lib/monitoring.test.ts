import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";
import { captureAppError } from "./monitoring";

describe("captureAppError", () => {
  it("forwards Error instances to Sentry", () => {
    const err = new Error("test error");
    captureAppError(err);
    expect(Sentry.captureException).toHaveBeenCalledWith(err, { extra: undefined });
  });

  it("wraps string values into Error objects", () => {
    captureAppError("string error");
    const call = vi.mocked(Sentry.captureException).mock.calls.at(-1)!;
    expect(call[0]).toBeInstanceOf(Error);
    expect((call[0] as Error).message).toBe("string error");
  });

  it("handles null with a default message", () => {
    captureAppError(null);
    const call = vi.mocked(Sentry.captureException).mock.calls.at(-1)!;
    expect((call[0] as Error).message).toBe("Unknown error");
  });

  it("handles undefined with a default message", () => {
    captureAppError(undefined);
    const call = vi.mocked(Sentry.captureException).mock.calls.at(-1)!;
    expect((call[0] as Error).message).toBe("Unknown error");
  });

  it("serializes plain objects to JSON", () => {
    captureAppError({ code: 42, detail: "oops" });
    const call = vi.mocked(Sentry.captureException).mock.calls.at(-1)!;
    expect((call[0] as Error).message).toContain("42");
  });

  it("passes extra context to Sentry", () => {
    captureAppError(new Error("x"), { userId: "u1" });
    const call = vi.mocked(Sentry.captureException).mock.calls.at(-1)!;
    expect(call[1]).toEqual({ extra: { userId: "u1" } });
  });
});
