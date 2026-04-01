import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { useTheme } from "./hooks/use-theme";

const THEME_KEY = "computelearn-theme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to light theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("reads stored theme from localStorage", () => {
    localStorage.setItem(THEME_KEY, JSON.stringify("dark"));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("sets data-theme attribute on document element", () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles from light to dark", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("toggles from dark to light", () => {
    localStorage.setItem(THEME_KEY, JSON.stringify("dark"));
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe("light");
  });

  it("persists theme to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(JSON.parse(localStorage.getItem(THEME_KEY)!)).toBe("dark");
  });

  it("returns a stable toggle reference", () => {
    const { result, rerender } = renderHook(() => useTheme());
    const firstToggle = result.current.toggle;
    rerender();
    expect(result.current.toggle).toBe(firstToggle);
  });
});
