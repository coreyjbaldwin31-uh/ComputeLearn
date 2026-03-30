"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary-fallback">
          <h1>Something went wrong</h1>
          <p>
            The platform encountered an unexpected error. Your progress is saved
            locally and will still be available after reloading.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="error-boundary-retry"
          >
            Try again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
