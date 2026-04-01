import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "./hooks/use-focus-trap";

describe("useFocusTrap", () => {
  it("returns a ref object", () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(result.current).toHaveProperty("current");
  });

  it("returns the same ref across renders", () => {
    const { result, rerender } = renderHook(() => useFocusTrap(false));
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });

  it("ref.current is null when not attached", () => {
    const { result } = renderHook(() => useFocusTrap(true));
    expect(result.current.current).toBeNull();
  });

  it("does not throw when isOpen toggles without a mounted ref", () => {
    const { rerender } = renderHook(({ open }) => useFocusTrap(open), {
      initialProps: { open: false },
    });
    expect(() => rerender({ open: true })).not.toThrow();
    expect(() => rerender({ open: false })).not.toThrow();
  });
});
