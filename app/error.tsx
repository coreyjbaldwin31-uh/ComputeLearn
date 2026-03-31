"use client";

import { useEffect } from "react";
import { captureAppError } from "@/lib/monitoring";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    captureAppError(error, {
      digest: error.digest,
      surface: "app-router-error",
    });
  }, [error]);

  return (
    <main className="error-boundary-fallback">
      <h1>Something went wrong</h1>
      <p>
        The platform hit an unexpected rendering error. Try the action again
        after resetting this view.
      </p>
      <button
        type="button"
        onClick={reset}
        className="error-boundary-retry"
      >
        Try again
      </button>
    </main>
  );
}
