import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";

afterEach(cleanup);

function fire(key: string, extra?: Partial<KeyboardEvent>) {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...extra }),
  );
}

describe("useKeyboardShortcuts", () => {
  it("calls navigateNext on j key", () => {
    const navigateNext = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext,
        navigatePrev: null,
        toggleTheme: vi.fn(),
        toggleKeyboardHelp: vi.fn(),
        closeOverlays: vi.fn(),
      }),
    );
    fire("j");
    expect(navigateNext).toHaveBeenCalledOnce();
  });

  it("calls navigatePrev on k key", () => {
    const navigatePrev = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext: null,
        navigatePrev,
        toggleTheme: vi.fn(),
        toggleKeyboardHelp: vi.fn(),
        closeOverlays: vi.fn(),
      }),
    );
    fire("k");
    expect(navigatePrev).toHaveBeenCalledOnce();
  });

  it("does not navigate when callbacks are null", () => {
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext: null,
        navigatePrev: null,
        toggleTheme: vi.fn(),
        toggleKeyboardHelp: vi.fn(),
        closeOverlays: vi.fn(),
      }),
    );
    // Should not throw
    fire("j");
    fire("k");
  });

  it("toggles keyboard help on ? key", () => {
    const toggleKeyboardHelp = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext: null,
        navigatePrev: null,
        toggleTheme: vi.fn(),
        toggleKeyboardHelp,
        closeOverlays: vi.fn(),
      }),
    );
    fire("?");
    expect(toggleKeyboardHelp).toHaveBeenCalledOnce();
  });

  it("toggles theme on Ctrl+Shift+D", () => {
    const toggleTheme = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext: null,
        navigatePrev: null,
        toggleTheme,
        toggleKeyboardHelp: vi.fn(),
        closeOverlays: vi.fn(),
      }),
    );
    fire("d", { ctrlKey: true, shiftKey: true });
    expect(toggleTheme).toHaveBeenCalledOnce();
  });

  it("calls closeOverlays on Escape", () => {
    const closeOverlays = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext: null,
        navigatePrev: null,
        toggleTheme: vi.fn(),
        toggleKeyboardHelp: vi.fn(),
        closeOverlays,
      }),
    );
    fire("Escape");
    expect(closeOverlays).toHaveBeenCalledOnce();
  });

  it("ignores shortcuts when target is INPUT", () => {
    const navigateNext = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        navigateNext,
        navigatePrev: null,
        toggleTheme: vi.fn(),
        toggleKeyboardHelp: vi.fn(),
        closeOverlays: vi.fn(),
      }),
    );

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", bubbles: true }),
    );
    // The event fires on the input, but our handler checks the target tag
    expect(navigateNext).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
