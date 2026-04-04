import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";

type MockMediaQueryList = {
  matches: boolean;
  media: string;
  addEventListener: (
    type: string,
    listener: (event: MediaQueryListEvent) => void,
  ) => void;
  removeEventListener: (
    type: string,
    listener: (event: MediaQueryListEvent) => void,
  ) => void;
  addListener: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
  onchange: null;
  dispatch: (matches: boolean) => void;
};

describe("usePrefersReducedMotion", () => {
  const originalMatchMedia = window.matchMedia;

  function createMatchMedia(initialMatches: boolean) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mediaQueryList: MockMediaQueryList = {
      matches: initialMatches,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: (_type, listener) => {
        listeners.add(listener);
      },
      removeEventListener: (_type, listener) => {
        listeners.delete(listener);
      },
      addListener: (listener) => {
        listeners.add(listener);
      },
      removeListener: (listener) => {
        listeners.delete(listener);
      },
      onchange: null,
      dispatch: (matches) => {
        mediaQueryList.matches = matches;
        listeners.forEach((listener) =>
          listener({ matches } as MediaQueryListEvent),
        );
      },
    };

    return {
      mediaQueryList,
      matchMedia: vi.fn(() => mediaQueryList as unknown as MediaQueryList),
    };
  }

  beforeEach(() => {
    const mock = createMatchMedia(false);
    window.matchMedia = mock.matchMedia as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns false when reduced motion is not preferred", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when reduced motion is preferred", () => {
    const mock = createMatchMedia(true);
    window.matchMedia = mock.matchMedia as typeof window.matchMedia;

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when media query preference changes", () => {
    const mock = createMatchMedia(false);
    window.matchMedia = mock.matchMedia as typeof window.matchMedia;

    const { result } = renderHook(() => usePrefersReducedMotion());

    act(() => {
      mock.mediaQueryList.dispatch(true);
    });
    expect(result.current).toBe(true);

    act(() => {
      mock.mediaQueryList.dispatch(false);
    });
    expect(result.current).toBe(false);
  });
});
