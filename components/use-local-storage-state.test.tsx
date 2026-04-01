import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { useLocalStorageState } from "./hooks/use-local-storage-state";

const TEST_KEY = "test-ls-state";

describe("useLocalStorageState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() =>
      useLocalStorageState(TEST_KEY, { count: 0 }),
    );
    expect(result.current[0]).toEqual({ count: 0 });
  });

  it("returns stored value when localStorage has data", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify({ count: 5 }));
    const { result } = renderHook(() =>
      useLocalStorageState(TEST_KEY, { count: 0 }),
    );
    expect(result.current[0]).toEqual({ count: 5 });
  });

  it("updates localStorage when set is called with a value", () => {
    const { result } = renderHook(() =>
      useLocalStorageState(TEST_KEY, "initial"),
    );

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toBe("updated");
  });

  it("updates localStorage when set is called with a function", () => {
    const { result } = renderHook(() =>
      useLocalStorageState(TEST_KEY, 10),
    );

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toBe(15);
  });

  it("handles array values", () => {
    const { result } = renderHook(() =>
      useLocalStorageState<string[]>(TEST_KEY, []),
    );

    act(() => {
      result.current[1]((prev) => [...prev, "item-1"]);
    });

    expect(result.current[0]).toEqual(["item-1"]);
  });

  it("returns the same setter reference across renders", () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorageState(TEST_KEY, 0),
    );

    const firstSetter = result.current[1];
    rerender();
    expect(result.current[1]).toBe(firstSetter);
  });
});
